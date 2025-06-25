import * as FirebaseFirestore from '@google-cloud/firestore';

import { HelpRequest, HelpRequestStatusSchema } from '../../domain/help-request/help-request.entity';
import { IHelpRequestRepository } from '../../domain/help-request/i-help-request.repository';
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

const HelpRequestDocSchema = z.object({
  id: HelpRequestIdSchema,
  proximityVerificationId: ProximityVerificationIdSchema,
  requesterId: UserIdSchema,
  status: HelpRequestStatusSchema,
  location: LocationSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});


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

  async save(helpRequest: HelpRequest, requester: User): Promise<HelpRequest> {
    

    const helpRequestRef = this.db.collection('helpRequests').doc(helpRequest.id.value);
    const batch = this.db.batch();

    const { status, location, createdAt, updatedAt, proximityVerificationId } = helpRequest.toPersistenceModel();
    batch.set(helpRequestRef, {
      id: helpRequest.id.value,
      requesterId: requester.id.value,
      proximityVerificationId,
      status,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        geohash: location.calcGeohash()
      },
      createdAt,
      updatedAt
    });

    const candidatesRef = helpRequestRef.collection('candidates');
    helpRequest.candidatesCollection.all.forEach((candidate) => {
      const { candidateId, status } = candidate.toPersistenceModel();
      batch.set(candidatesRef.doc(candidateId), {
        candidateId,
        status
      });
    });

    await batch.commit();
    return helpRequest;
  }


  async findById(id: HelpRequestId): Promise<HelpRequest | null> {
    const helpRequestRef = this.db.collection('helpRequests').doc(id.value);
    const doc = await helpRequestRef.get();

    if (!doc.exists) return null;

    const data = HelpRequestDocSchema.parse(doc.data());
    const candidatesSnapshot = await helpRequestRef.collection('candidates').get();
    const candidates = candidatesSnapshot.docs.map((doc) => {
      const candidateData = doc.data();
      return  Candidate.fromPersistenceModel({
        candidateId:  candidateData.candidateId,
        status: candidateData.status
      });
    });
    const candidatesCollection = CandidatesCollection.create(candidates);

    const location = Location.create(data.location);

    return HelpRequest.create(
      HelpRequestId.create(data.id),
      ProximityVerificationId.create(data.proximityVerificationId),
      UserId.create(data.requesterId),
      data.status,
      location,
      data.createdAt,
      data.updatedAt,
      candidatesCollection,
      this.clock
    );
  }

  async add(command: CreateHelpRequestCommand): Promise<HelpRequest> {


    const helpRequestRef = this.db.collection('helpRequests').doc();
    const batch = this.db.batch();

    const requesterId = UserId.create(command.requesterId.value);
    const proximityVerificationId = ProximityVerificationId.create();
    const status = 'pending';
    const location = command.location;
    const createdAt = this.clock.now();
    const updatedAt = this.clock.now();

    const helpRequestObject = {
      id: helpRequestRef.id,
      proximityVerificationId: proximityVerificationId.value,
      requesterId: requesterId.value,
      status,
      location: {
        ...location.toPersistenceModel(),
        geohash: location.calcGeohash()
      },
      createdAt,
      updatedAt,
    };

    batch.set(helpRequestRef, helpRequestObject);

    await batch.commit();

    const helpRequestId = HelpRequestId.create(helpRequestRef.id);
    const candidatesCollection = CandidatesCollection.create();
    const helpRequest = HelpRequest.create(
      helpRequestId,
      proximityVerificationId,
      requesterId,
      status,
      location,
      createdAt,
      updatedAt,
      candidatesCollection,
      this.clock
    );
    
    return helpRequest;
  }
}