import * as FirebaseFirestore from '@google-cloud/firestore';

import { HelpRequest } from '../../domain/help-request/help-request.entity';
import { IHelpRequestRepository } from '../../domain/help-request/i-help-request.repository';
import { HelpRequestId } from '../../domain/help-request/help-request-id.value';
import { CreateHelpRequestCommand } from '../../domain/help-request/create-help-request.usecase';

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

  async add(command: CreateHelpRequestCommand): Promise<HelpRequest> {
    throw new Error('Method not implemented.');
  }
}