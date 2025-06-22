import * as FirebaseFirestore from '@google-cloud/firestore';

import { HelpRequest } from '../../domain/help-request/help-request.entity';
import { IHelpRequestRepository } from '../../domain/help-request/i-help-request.repository';
import { HelpRequestId } from '../../domain/help-request/help-request-id.value';
import { CreateHelpRequestCommand } from '../../domain/help-request/create-help-request.usecase';
import { User } from '../../domain/user/User.entity';

export class HelpRequestRepository implements IHelpRequestRepository {
  private db: FirebaseFirestore.Firestore;

  static create(db: FirebaseFirestore.Firestore): HelpRequestRepository {
    return new HelpRequestRepository(db);
  }

  private constructor(db: FirebaseFirestore.Firestore) {
    this.db = db;
  }

  async save(helpRequest: HelpRequest, requester: User): Promise<HelpRequest> {
    
    const batch = this.db.batch();
    const helpRequestRef = this.db.collection('helpRequests').doc(helpRequest.id.value);

    const { status, location, createdAt, updatedAt } = helpRequest.toPersistenceModel();
    batch.set(helpRequestRef, {
      id: helpRequest.id.value,
      requesterId: requester.id.value,
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
    throw new Error('Method not implemented.');
  }

  async add(command: CreateHelpRequestCommand): Promise<HelpRequest> {
    throw new Error('Method not implemented.');
  }
}