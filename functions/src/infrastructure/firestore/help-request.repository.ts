import * as FirebaseFirestore from '@google-cloud/firestore';

import { HelpRequest } from '../../domain/help-request/help-request.entity';
import { IHelpRequestRepository } from '../../domain/help-request/i-help-request.repository';
import { HelpRequestId } from '../../domain/help-request/help-request-id.value';
import { CreateHelpRequestInput } from '../../domain/help-request/create-help-request.shcema';
import { User } from '../../domain/user/User.entity';

export class HelpRequestRepository implements IHelpRequestRepository {
  private db: FirebaseFirestore.Firestore;

  static create(db: FirebaseFirestore.Firestore): HelpRequestRepository {
    return new HelpRequestRepository(db);
  }

  private constructor(db: FirebaseFirestore.Firestore) {
    this.db = db;
  }

  async save(helpRequest: HelpRequest): Promise<HelpRequest> {
    throw new Error('Method not implemented.');
  }

  async findById(id: HelpRequestId): Promise<HelpRequest | null> {
    throw new Error('Method not implemented.');
  }

  async add(input: CreateHelpRequestInput, requester: User): Promise<HelpRequest> {
    throw new Error('Method not implemented.');
  }
}