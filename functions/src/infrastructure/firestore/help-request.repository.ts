import {Firestore, GeoPoint, Timestamp} from "firebase-admin/firestore";

import {HelpRequest, HelpRequestStatusSchema} from "../../domain/help-request/help-request.entity.js";
import {HelpRequestWithRequesterInfo, IHelpRequestRepository} from "../../domain/help-request/i-help-request.repository.js";
import {HelpRequestId, HelpRequestIdSchema} from "../../domain/help-request/help-request-id.value.js";
import {User} from "../../domain/user/User.entity.js";
import {IClock} from "../../domain/shared/service/i-clock.service.js";
import {UserId, UserIdSchema} from "../../domain/user/user-id.value.js";
import {ProximityVerificationId, ProximityVerificationIdSchema} from "../../domain/help-request/proximity-verification-id.value.js";
import {CandidatesCollection} from "../../domain/help-request/candidates.collection.js";
import {Candidate} from "../../domain/help-request/candidate.entity.js";

import {z} from "zod";
import {Location, LocationSchema} from "../../domain/shared/value-object/Location.value.js";
import {DeviceId} from "../../domain/device/device-id.value.js";
import {UserInfo, UserInfoDTO, UserInfoSchema} from "../../domain/help-request/user-info.dto.js";
import {logger} from "firebase-functions";

const HelpRequestDocSchema = z.object({
  id: HelpRequestIdSchema,
  proximityVerificationId: ProximityVerificationIdSchema,
  requesterId: UserIdSchema,
  status: HelpRequestStatusSchema,
  location: LocationSchema,
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  proximityCheckDeadline: z.instanceof(Timestamp),
  requesterInfo: UserInfoSchema,
});

export type HelpRequestDoc = z.infer<typeof HelpRequestDocSchema>;

export class HelpRequestRepository implements IHelpRequestRepository {
  private db: Firestore;
  private clock: IClock;

  static create(db: Firestore, clock: IClock): HelpRequestRepository {
    return new HelpRequestRepository(db, clock);
  }

  private constructor(db: Firestore, clock: IClock) {
    this.db = db;
    this.clock = clock;
  }

  async save(helpRequest: HelpRequest): Promise<HelpRequest> {
    const helpRequestRef = this.db.collection("helpRequests").doc(helpRequest.id.value);
    const batch = this.db.batch();

    const helpRequestData = helpRequest.toPersistenceModel();
    const helpRequestDocData = {
      id: helpRequestData.id,
      proximityVerificationId: helpRequestData.proximityVerificationId,
      requesterId: helpRequestData.requesterId,
      status: helpRequestData.status,
      location: new GeoPoint(helpRequestData.location.latitude, helpRequestData.location.longitude),
      createdAt: Timestamp.fromDate(helpRequestData.createdAt),
      updatedAt: Timestamp.fromDate(helpRequestData.updatedAt),
      proximityCheckDeadline: Timestamp.fromDate(helpRequestData.proximityCheckDeadline),
    };
    logger.info("Saving helpRequestDocData:", helpRequestDocData);
    batch.set(helpRequestRef, helpRequestDocData, {merge: true});

    const candidates = helpRequestData.candidates;
    if ( candidates && candidates.length > 0 ) {
      candidates.forEach((candidate) => {
        const candidateRef = helpRequestRef.collection("candidates").doc(candidate.id);
        const candidateData: UserInfoDTO = {
          id: candidate.id,
          nickname: candidate.nickname,
          iconUrl: candidate.iconUrl,
          physicalDescription: candidate.physicalDescription,
          deviceId: candidate.deviceId,
        };
        logger.info("Saving candidateData:", candidateData);
        batch.set(candidateRef, candidateData, {merge: true});
      });
    }
    const candidatesCollection = CandidatesCollection.create(
      helpRequestData.candidates.map((candidate) => {
        const userInfo = UserInfo.create({
          id: candidate.id,
          nickname: candidate.nickname,
          iconUrl: candidate.iconUrl,
          physicalDescription: candidate.physicalDescription,
          deviceId: candidate.deviceId,
        });
        return Candidate.create(
          userInfo,
          candidate.status
        );
      })
    );

    await batch.commit();

    return HelpRequest.create(
      helpRequest.id,
      helpRequest.proximityVerificationId,
      helpRequest.requesterId,
      helpRequest.status,
      helpRequest.location,
      helpRequest.createdAt,
      this.clock.now(),
      candidatesCollection,
      helpRequest.proximityCheckDeadline,
      this.clock
    );
  }


  async findWithRequesterInfoById(id: HelpRequestId): Promise<HelpRequestWithRequesterInfo | null> {
    logger.info("HelpRequestRepository.findWithRequesterInfoById called with ID:", {helpRequestId: id.value});
    const helpRequestRef = this.db.collection("helpRequests").doc(id.value);
    const candidateCollectionRef = helpRequestRef.collection("candidates");
    const doc = await helpRequestRef.get();

    if (!doc.exists) {
      logger.info("Help request document not found for ID:", {helpRequestId: id.value});
      return null;
    }

    logger.info("Help request document data:", doc.data());
    try {
      const helpRequestData = HelpRequestDocSchema.parse(doc.data());
      logger.info("Help request document data parsed successfully.");

      const candidatesSnapshot = await candidateCollectionRef.get();
      const candidatesCollection = CandidatesCollection.create(
        candidatesSnapshot.docs.map((doc) => {
          const candidateData = doc.data();
          logger.info("Candidate document data:", candidateData);
          const UserInfoDTO = UserInfoSchema.parse(candidateData);
          logger.info("Candidate UserInfoDTO parsed successfully.");
          const userInfo = UserInfo.fromPersistenceModel(UserInfoDTO);
          return Candidate.create(
            userInfo,
            candidateData.status
          );
        })
      );
      logger.info("Candidates collection created.");

      const helpRequest = HelpRequest.create(
        HelpRequestId.create(helpRequestData.id),
        ProximityVerificationId.create(helpRequestData.proximityVerificationId),
        UserId.create(helpRequestData.requesterId),
        helpRequestData.status,
        Location.create({
          latitude: helpRequestData.location.latitude,
          longitude: helpRequestData.location.longitude,
        }),
        helpRequestData.createdAt.toDate(),
        helpRequestData.updatedAt.toDate(),
        candidatesCollection,
        helpRequestData.proximityCheckDeadline.toDate(),
        this.clock
      );
      logger.info("HelpRequest entity created.");

      const requesterInfoDTO = helpRequestData.requesterInfo;
      const requester = UserInfo.fromPersistenceModel(requesterInfoDTO);
      logger.info("Requester UserInfo entity created.");

      return {
        helpRequest,
        requester,
      };
    } catch (error) {
      logger.error("Error parsing help request or candidate data:", {helpRequestId: id.value, errorMessage: error instanceof Error ? error.message : "Unknown error", errorStack: error instanceof Error ? error.stack : "No stack available"});
      throw error; // Re-throw the error after logging
    }
  }

  async add(requester: User, requestedLocation: Location, requestedDeviceId: DeviceId): Promise<HelpRequest> {
    const batch = this.db.batch();
    const helpRequestRef = this.db.collection("helpRequests").doc();

    const helpRequestId = HelpRequestId.create(helpRequestRef.id);
    const proximityVerificationId = ProximityVerificationId.create();
    const requesterId = requester.id;
    const requesterInfo = {
      "id": requesterId.value,
      "nickname": requester.nickname,
      "iconUrl": requester.iconUrl,
      "deviceId": requestedDeviceId.toString(),
      "physicalDescription": requester.physicalFeatures || "", // Assuming physicalDescription is optional
    };
    const status = "pending";
    const location = new GeoPoint(requestedLocation.latitude, requestedLocation.longitude);
    const createdAt = Timestamp.fromDate(this.clock.now());
    const updatedAt = createdAt;
    const proximityCheckDeadline = createdAt; // Assuming proximityCheckDeadline is the same as createdAt for now

    const helpRequestData = {
      id: helpRequestId.value,
      proximityVerificationId: proximityVerificationId.value,
      requesterId: requesterId.value,
      requesterInfo,
      status,
      location,
      createdAt,
      updatedAt,
      proximityCheckDeadline,
    };

    batch.set(helpRequestRef, helpRequestData);
    await batch.commit();

    return HelpRequest.create(
      helpRequestId,
      proximityVerificationId,
      requesterId,
      status,
      requestedLocation,
      createdAt.toDate(),
      updatedAt.toDate(),
      CandidatesCollection.create(),
      proximityCheckDeadline.toDate(), // Assuming proximityCheckDeadline is the same as createdAt for now
      this.clock
    );
  }
}
