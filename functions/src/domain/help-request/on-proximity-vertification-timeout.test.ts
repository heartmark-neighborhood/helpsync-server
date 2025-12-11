import {TestClock} from "../../../__test__/fake/test-clock.service.js";
import {Location} from "../shared/value-object/Location.value.js";
import {DeviceToken} from "../device/device-token.value.js";
import {UserId} from "../user/user-id.value.js";
import {Device} from "../device/device.entity.js";
import {MemoryHelpRequestRepository} from "../../../__test__/fake/memory-help-request.repository.js";
import {MemoryDeviceRepository} from "../../../__test__/fake/memory-device.repository.js";
import {DeviceId} from "../device/device-id.value.js";
import {ProximityVerificationTimeoutCommand, ProximityVerificationTimeoutUseCase} from "./on-proximity-verification-timeout.usecase.js";
import {UserInfo} from "./user-info.dto.js";
import {IHelpRequestNotifier} from "./service/i-help-request.notifier.js";
class DummyHelpRequestNotifier implements IHelpRequestNotifier {
  private notifications: { deviceToken: string }[] = [];
  async notifyRequesterOfMatches(deviceToken: DeviceToken, _requesterInfo: UserInfo): Promise<void> {
    // Dummy implementation for testing
    this.notifications.push({deviceToken: deviceToken.value});
    return Promise.resolve();
  }

  async notifySupporterOfMatches(deviceToken: DeviceToken, _candidatesInfo: UserInfo[]): Promise<void> {
    // Dummy implementation for testing
    this.notifications.push({deviceToken: deviceToken.value});
    return Promise.resolve();
  }

  getNotifications(): { deviceToken: string }[] {
    return this.notifications;
  }
}

describe("近接確認応答の制限時間超過", () => {
  it("ヘルプ要請のステータスを更新し、通知を送信する", async () => {
    const helpRequestRepository = new MemoryHelpRequestRepository();
    const deviceRepository = new MemoryDeviceRepository();
    deviceRepository.save(Device.create(
      DeviceId.create("requester-device-id"),
      UserId.create("requester-id"),
      DeviceToken.create("dummy-requester-device-token"),
      Location.create({latitude: 0, longitude: 0}),
      new Date(),
      new TestClock(),
    ));
    const helpRequestNotifier = new DummyHelpRequestNotifier();
    const useCase = ProximityVerificationTimeoutUseCase.create(helpRequestRepository, deviceRepository, helpRequestNotifier);

    const initHelpRequest = await helpRequestRepository.getForTimeoutTestingWithCandidates();

    const command = ProximityVerificationTimeoutCommand.create({helpRequestId: initHelpRequest.id.value});
    await useCase.execute(command);

    const notifications = helpRequestNotifier.getNotifications();


    const updatedHelpRequestInfo = await helpRequestRepository.findWithRequesterInfoById(initHelpRequest.id);
    if (!updatedHelpRequestInfo) {
      throw new Error("Help request not found after timeout");
    }
    const {helpRequest} = updatedHelpRequestInfo;

    expect(helpRequest.candidatesCollection.withStatus("help-request-notified").all.length).toBe(2);
    expect(helpRequest.status).toBe("sent");
    expect(notifications.length).toBe(3);
    expect(notifications[0].deviceToken).toBe("supporter1-device-token");
    expect(notifications[1].deviceToken).toBe("supporter2-device-token");
  });

  it("近接確認に成功した候補者がいない場合、ヘルプ要請は失敗ステータスとなり、通知は送信されない", async () => {
    const helpRequestRepository = new MemoryHelpRequestRepository();
    const deviceRepository = new MemoryDeviceRepository();
    const helpRequestNotifier = new DummyHelpRequestNotifier();
    const useCase = ProximityVerificationTimeoutUseCase.create(helpRequestRepository, deviceRepository, helpRequestNotifier);

    const initHelpRequest = await helpRequestRepository.getForTimeoutTestingWithoutSuccessfulCandidates();

    const command = ProximityVerificationTimeoutCommand.create({helpRequestId: initHelpRequest.id.value});
    await useCase.execute(command);

    const notifications = helpRequestNotifier.getNotifications();

    const updatedHelpRequestInfo = await helpRequestRepository.findWithRequesterInfoById(initHelpRequest.id);
    if (!updatedHelpRequestInfo) {
      throw new Error("Help request not found after timeout");
    }
    const {helpRequest} = updatedHelpRequestInfo;

    expect(helpRequest.status).toBe("failed");
    expect(notifications.length).toBe(0);
  });
});
