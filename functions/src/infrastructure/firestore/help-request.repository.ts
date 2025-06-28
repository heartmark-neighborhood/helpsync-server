import * as FirebaseFirestore from '@google-cloud/firestore';

import { HelpRequest, HelpRequestStatusSchema } from '../../domain/help-request/help-request.entity';
import { HelpRequestWithRequesterInfo, IHelpRequestRepository } from '../../domain/help-request/i-help-request.repository';
import { HelpRequestId, HelpRequestIdSchema } from '../../domain/help-request/help-request-id.value';
import { CreateHelpRequestCommand } from '../../domain/help-request/create-help-request.usecase';
import { User } from '../../domain/user/User.entity';
import { IClock } from '../../domain/shared/service/i-clock.service';
import { UserId, UserIdSchema } from '../../domain/user/user-id.value';
import { ProximityVerificationId, ProximityVerificationIdSchema } from '../../domain/help-request/proximity-verification-id.value';
import { CandidatesCollection } from '../../domain/help-request/candidates.collection';
import { Candidate } from '../../domain/help-request/candidate.entity';

import { z } from 'zod';
import { Location, LocationSchema } from '../../domain/shared/value-object/Location.value';
import { DeviceId } from '../../domain/device/device-id.value';
import { GeoPoint, Timestamp } from 'firebase-admin/firestore';

const HelpRequestDocSchema = z.object({
  id: HelpRequestIdSchema,
  proximityVerificationId: ProximityVerificationIdSchema,
  requesterId: UserIdSchema,
  status: HelpRequestStatusSchema,
  location: LocationSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  proximityCheckDeadline: z.date(),
  requesterInfo: z.object({
    nickname: z.string(),
    iconUrl: z.string(),
    deviceId: z.string()
  })
});

export type HelpRequestDoc = z.infer<typeof HelpRequestDocSchema>;

export class HelpRequestRepository implements IHelpRequestRepository {
  private db: FirebaseFirestore.Firestore;
  private clock: IClock;

  static create(db: FirebaseFirestore.Firestore, clock: IClock): HelpRequestRepository {
    return new HelpRequestRepository(db, clock);
  }

  private constructor(db: FirebaseFirestore.Firestore, clock: IClock) {
    this.db = db;
    this.clock = clock;
  }

  async save(helpRequest: HelpRequest): Promise<HelpRequest> {
    const helpRequestRef = this.db.collection('helpRequests').doc(helpRequest.id.value);
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
      proximityCheckDeadline: Timestamp.fromDate(helpRequestData.proximityCheckDeadline)
    };
    batch.update(helpRequestRef, helpRequestDocData);

    const candidates = helpRequestData.candidates;
    if( candidates && candidates.length > 0 ) {
      candidates.forEach((candidate) => {
        const candidateRef = helpRequestRef.collection('candidates').doc(candidate.candidateId);
        const candidateData = {
          candidateId: candidate.candidateId,
          status: candidate.status,
          notifiedDeviceId: candidate.notifiedDeviceId
        };
        batch.set(candidateRef, candidateData, { merge: true });
      });
    }
    const candidatesCollection = CandidatesCollection.create(
      helpRequestData.candidates.map((candidate) => Candidate.fromPersistenceModel(candidate))
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
    const helpRequestRef = this.db.collection('helpRequests').doc(id.value);
    const candidateCollectionRef = helpRequestRef.collection('candidates');
    const doc = await helpRequestRef.get();

    if (!doc.exists) return null;

    const helpRequestData = HelpRequestDocSchema.parse(doc.data());
    const candidatesSnapshot = await candidateCollectionRef.get();
    const candidatesCollection = CandidatesCollection.create(
      candidatesSnapshot.docs.map((doc) => {
        const candidateData = doc.data();
        return Candidate.create(
          UserId.create(candidateData.candidateId),
          DeviceId.create(candidateData.notifiedDeviceId),
          candidateData.status,
        );
      })
    );

    const helpRequest = HelpRequest.create(
      HelpRequestId.create(helpRequestData.id),
      ProximityVerificationId.create(helpRequestData.proximityVerificationId),
      UserId.create(helpRequestData.requesterId),
      helpRequestData.status,
      Location.create({
        latitude: helpRequestData.location.latitude,
        longitude: helpRequestData.location.longitude
      }),
      helpRequestData.createdAt,
      helpRequestData.updatedAt,
      CandidatesCollection.create(), // Assuming candidates are not loaded here
      helpRequestData.proximityCheckDeadline,
      this.clock
    );

    
    const requesterInfo = helpRequestData.requesterInfo;
    const requester = {
      id: UserId.create(requesterInfo.deviceId),
      nickname: requesterInfo.nickname,
      iconUrl: requesterInfo.iconUrl,
      deviceId: DeviceId.create(requesterInfo.deviceId)
    };

    return {
      helpRequest,
      requester
    };


  }

  async add(requester: User, requestedLocation: Location, requestedDeviceId: DeviceId): Promise<HelpRequest> {
    const batch = this.db.batch();
    const helpRequestRef = this.db.collection('helpRequests').doc();

    const helpRequestId = HelpRequestId.create(helpRequestRef.id);
    const proximityVerificationId = ProximityVerificationId.create();
    const requesterId = requester.id;
    const requesterInfo = {
      "nickname": requester.nickname,
      "iconUrl": requester.iconUrl,
      "deviceId": requestedDeviceId.toString()
    }
    const status = 'pending';
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
      proximityCheckDeadline
    };

    batch.set(helpRequestRef, helpRequestData);

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