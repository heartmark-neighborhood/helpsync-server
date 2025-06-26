import { CreateHelpRequestCommand } from './create-help-request.usecase';
import { CreateHelpRequestUseCase } from './create-help-request.usecase';
import { MemoryHelpRequestRepository } from '../../../__test__/fake/memory-help-request.repository';
import { MemoryUserRepository } from '../../../__test__/fake/memory-user-repository';
import { UserId } from '../user/user-id.value';
import { TestClock } from '../../../__test__/fake/test-clock.service';
import { IProximityVerificationNotifier } from './service/i-proximity-verification.notifier';
import { ProximityVerificationId } from './proximity-verification-id.value';
import { Location } from '../shared/value-object/Location.value';

class DummyNotifier implements IProximityVerificationNotifier {
  async send(targetUserId: UserId, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void> {
    // Dummy implementation
  }
}

describe('ヘルプ要請作成要求', () => {
  it('ヘルプ要請を作成する', async () => {
    const userRepository = new MemoryUserRepository();
    const helpRequestRepository = new MemoryHelpRequestRepository();
    const notifier = new DummyNotifier();

    const usecase = CreateHelpRequestUseCase.create(
      helpRequestRepository,
      userRepository,
      notifier
    );

    const command = CreateHelpRequestCommand.create(
      UserId.create('requester-id'),
      Location.create({ latitude: 35.6895, longitude: 139.6917 }), // 東京の座標
      new TestClock(),
    );

    const helpRequest = await usecase.execute(command);
    const candidates = helpRequest.candidatesCollection.all;

    expect(helpRequest).toBeDefined();
    expect(helpRequest.id).toBeDefined();
    expect(helpRequest.requesterId.value).toBe('requester-id');
    expect(helpRequest.location.latitude).toBe(35.6895);
    expect(helpRequest.location.longitude).toBe(139.6917);
    expect(helpRequest.createdAt).toBeDefined();
    expect(helpRequest.updatedAt).toBeDefined();
    expect(helpRequest.status).toBe('searching'); // 初期状態は 'searching'
    expect(helpRequest.candidatesCollection).toBeDefined();
    expect(candidates.length).toBe(2);
    expect(candidates[0].candidateId.value).toBe('supporter1-id');
    expect(candidates[0].statusIs("proximity-verification-requested")).toBe(true);
    expect(candidates[1].candidateId.value).toBe('supporter2-id');
    expect(candidates[1].statusIs("proximity-verification-requested")).toBe(true);

    expect(helpRequest.proximityVerificationId).toBeDefined();
    expect(helpRequest.proximityVerificationId.value).toBeDefined();
  })
});