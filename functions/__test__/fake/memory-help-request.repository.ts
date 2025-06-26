import { IHelpRequestRepository } from '../../src/domain/help-request/i-help-request.repository';
import { HelpRequest } from '../../src/domain/help-request/help-request.entity';
import { HelpRequestId } from '../../src/domain/help-request/help-request-id.value';
import { CreateHelpRequestCommand } from '../../src/domain/help-request/create-help-request.usecase';
import { ProximityVerificationId } from '../../src/domain/help-request/proximity-verification-id.value';
import { CandidatesCollection } from '../../src/domain/help-request/candidates.collection';
import { User } from '../../src/domain/user/User.entity';

export class MemoryHelpRequestRepository implements IHelpRequestRepository {
  private helpRequests: HelpRequest[] = [];

  constructor() {
    // Initialize with some dummy data if needed
    // this.helpRequests.push(new HelpRequest(new HelpRequestId('1'), 'Sample request', new User('1', 'John Doe')));
  }

  async save(helpRequest: HelpRequest, requester: User): Promise<HelpRequest> {
    const index = this.helpRequests.findIndex(hr => hr.id.equals(helpRequest.id));
    if (index !== -1) {
      this.helpRequests[index] = helpRequest;
    } else {
      this.helpRequests.push(helpRequest);
    }
    return helpRequest;
  }

  async findById(id: HelpRequestId): Promise<HelpRequest | null> {
    const helpRequest = this.helpRequests.find(hr => hr.id.equals(id));
    return helpRequest || null;
  }

  async add(command: CreateHelpRequestCommand): Promise<HelpRequest> {
    const newHelpRequest = HelpRequest.create(
      HelpRequestId.create(),
      ProximityVerificationId.create(),
      command.requesterId,
      'pending',
      command.location,
      command.clock.now(),
      command.clock.now(),
      CandidatesCollection.create(),
      command.clock
    );
    this.helpRequests.push(newHelpRequest);
    return newHelpRequest;
  }

}