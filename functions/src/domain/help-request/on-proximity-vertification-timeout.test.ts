import {MemoryHelpRequestRepository} from "../../../__test__/fake/memory-help-request.repository";
import {DeviceId} from "../device/device-id.value";
import {ProximityVerificationTimeoutCommand, ProximityVerificationTimeoutUseCase} from "./on-proximity-verification-timeout.usecase";
import {UserInfo} from "./user-info.dto";
import {IHelpRequestNotifier} from "./service/i-help-request.notifier";

class DummyHelpRequestNotifier implements IHelpRequestNotifier {
  private notifications: { deviceId: string }[] = [];
  async notifyRequesterOfMatches(deviceId: DeviceId, requesterInfo: UserInfo): Promise<void> {
    // Dummy implementation for testing
    this.notifications.push({deviceId: deviceId.value});
    return Promise.resolve();
  }

  async notifySupporterOfMatches(deviceId: DeviceId, candidatesInfo: UserInfo[]): Promise<void> {
    // Dummy implementation for testing
    this.notifications.push({deviceId: deviceId.value});
    return Promise.resolve();
  }

  getNotifications(): { deviceId: string }[] {
    return this.notifications;
  }
}

describe("近接確認応答の制限時間超過", () => {
  it("ヘルプ要請のステータスを更新し、通知を送信する", async () => {
    const helpRequestRepository = new MemoryHelpRequestRepository();
    const helpRequestNotifier = new DummyHelpRequestNotifier();
    const useCase = ProximityVerificationTimeoutUseCase.create(helpRequestRepository, helpRequestNotifier);

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
    expect(notifications[0].deviceId).toBe("supporter1-device1-id");
    expect(notifications[1].deviceId).toBe("supporter2-device1-id");
  });
});
