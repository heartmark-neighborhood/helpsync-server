import { HelpRequestWithRequesterInfo, IHelpRequestRepository } from '../../src/domain/help-request/i-help-request.repository';
import { HelpRequest } from '../../src/domain/help-request/help-request.entity';
import { HelpRequestId } from '../../src/domain/help-request/help-request-id.value';
import { Location } from '../../src/domain/shared/value-object/Location.value';
import { ProximityVerificationId } from '../../src/domain/help-request/proximity-verification-id.value';
import { CandidatesCollection } from '../../src/domain/help-request/candidates.collection';
import { User } from '../../src/domain/user/User.entity';
import { DeviceId } from '../../src/domain/device/device-id.value';
import { TestClock } from './test-clock.service';
import { UserId } from '../../src/domain/user/user-id.value';
import { RequesterInfo } from '../../src/domain/help-request/requester-info.dto';

export class MemoryHelpRequestRepository implements IHelpRequestRepository {
  private helpRequests: HelpRequest[] = [];

  constructor(private clock: TestClock = new TestClock()) {}

  async save(helpRequest: HelpRequest): Promise<HelpRequest> {
    const index = this.helpRequests.findIndex(hr => hr.id.equals(helpRequest.id));
    if (index !== -1) {
      this.helpRequests[index] = helpRequest;
    } else {
      this.helpRequests.push(helpRequest);
    }
    return helpRequest;
  }

  async findWithRequesterInfoById(id: HelpRequestId): Promise<HelpRequestWithRequesterInfo | null> {
    const helpRequest = this.helpRequests.find(hr => hr.id.equals(id));
    if (!helpRequest) return null;

    const requesterInfo: RequesterInfo = {
      id: UserId.create("requester-id"), // Placeholder, should be fetched from User entity
      nickname: 'Test User', // Placeholder, should be fetched from User entity
      iconUrl: 'https://example.com/icon.png', // Placeholder, should be fetched from User entity
      deviceId: DeviceId.create("device-id") // Placeholder, should be fetched from Device entity
    }

    return {
      helpRequest,
      requester: requesterInfo
    };
  }

  async add(requester: User, location: Location, deviceId: DeviceId): Promise<HelpRequest> {
    const newHelpRequest = HelpRequest.create(
      HelpRequestId.create(),
      ProximityVerificationId.create(),
      requester.id,
      'pending',
      location,
      this.clock.now(),
      this.clock.now(),
      CandidatesCollection.create(),
      this.clock.now(),
      this.clock
    );
    this.helpRequests.push(newHelpRequest);
    return newHelpRequest;
  }

}