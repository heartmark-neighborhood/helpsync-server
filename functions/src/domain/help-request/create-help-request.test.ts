import {CreateHelpRequestCommand, CreateHelpRequestUseCase} from "./create-help-request.usecase.js";
import {MemoryHelpRequestRepository} from "../../../__test__/fake/memory-help-request.repository.js";
import {MemoryUserRepository} from "../../../__test__/fake/memory-user.repository.js";
import {UserId} from "../user/user-id.value.js";
import {TestClock} from "../../../__test__/fake/test-clock.service.js";
import {IProximityVerificationNotifier} from "./service/i-proximity-verification.notifier.js";
import {ProximityVerificationId} from "./proximity-verification-id.value.js";
import {Location} from "../shared/value-object/Location.value.js";
import {IProximityVerificationTimeoutScheduler} from "./service/i-proximity-verfication-timeout.scheduler.js";
import {MemoryDeviceRepository} from "../../../__test__/fake/memory-device.repository.js";
import {DeviceId} from "../device/device-id.value.js";
import {Device} from "../device/device.entity.js";
import {HelpRequestId} from "./help-request-id.value.js";
import {DevicesCollection} from "../device/devices.collection.js";
import {DeviceToken} from "../device/device-token.value.js";

class DummyNotifier implements IProximityVerificationNotifier {
  async send(_targetDeviceId: DeviceId, _proximityVerificationId: ProximityVerificationId, _expiredAt: Date): Promise<void> {
    // Dummy implementation
  }
}

class DummyScheduler implements IProximityVerificationTimeoutScheduler {
  async schedule(_helpRequestId: HelpRequestId, _timeoutAt: Date): Promise<void> {
    // Dummy implementation
  }

  async cancel(_helpRequestId: HelpRequestId): Promise<void> {
    // Dummy implementation
  }
}

describe("ヘルプ要請作成要求", () => {
  it("ヘルプ要請を作成する", async () => {
    const userRepository = new MemoryUserRepository();
    const helpRequestRepository = new MemoryHelpRequestRepository();
    const deviceRepository = new MemoryDeviceRepository();
    const notifier = new DummyNotifier();
    const scheduler = new DummyScheduler();

    const usecase = CreateHelpRequestUseCase.create(
      helpRequestRepository,
      userRepository,
      deviceRepository,
      notifier,
      scheduler
    );

    const command = CreateHelpRequestCommand.create(
      UserId.create("requester-id"),
      Location.create({latitude: 35.6895, longitude: 139.6917}), // 東京の座標,
      DeviceId.create("requester-device-id"),
      new TestClock()
    );

    const helpRequest = await usecase.execute(command);
    const candidates = helpRequest.candidatesCollection.all;

    expect(helpRequest).toBeDefined();
    expect(helpRequest.id).toBeDefined();
    expect(helpRequest.requesterId.value).toBe("requester-id");
    expect(helpRequest.location.latitude).toBe(35.6895);
    expect(helpRequest.location.longitude).toBe(139.6917);
    expect(helpRequest.createdAt).toBeDefined();
    expect(helpRequest.updatedAt).toBeDefined();

    expect(helpRequest.status).toBe("proximity-verification-requested"); // 初期状態は 'proximity-verification-requested'
    expect(helpRequest.candidatesCollection).toBeDefined();
    expect(candidates.length).toBe(2);
    expect(candidates[0].userInfo.id.value).toBe("supporter1-id");
    expect(candidates[0].statusIs("proximity-verification-requested")).toBe(true);
    expect(candidates[1].userInfo.id.value).toBe("supporter2-id");
    expect(candidates[1].statusIs("proximity-verification-requested")).toBe(true);

    expect(helpRequest.proximityVerificationId).toBeDefined();
    expect(helpRequest.proximityVerificationId.value).toBeDefined();
  });

  it("重複なしかつ有効なデバイスのコレクションを取得する", async () => {
    const clock = new TestClock();
    const devicesCollection = DevicesCollection.create([
      Device.create(
        DeviceId.create("supporter1-device1-id"),
        UserId.create("supporter1-id"),
        DeviceToken.create("supporter1-device-token"),
        Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
        new Date(2023, 10, 1, 12, 0, 0), // Example date
        clock
      ),
      Device.create(
        DeviceId.create("supporter1-device2-id"),
        UserId.create("supporter1-id"),
        DeviceToken.create("supporter1-device-token"),
        Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
        new Date(2023, 10, 1, 11, 0, 0), // Example date
        clock
      ),
      Device.create(
        DeviceId.create("supporter2-device1-id"),
        UserId.create("supporter2-id"),
        DeviceToken.create("supporter2-device-token"),
        Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
        new Date(2023, 10, 1, 12, 0, 0), // Example date
        clock
      ),
    ]);

    const uniqueLatestDevices = devicesCollection.toUniqueLatest();

    expect(uniqueLatestDevices.length).toBe(2);
    expect(uniqueLatestDevices.all[0].id.value).toBe("supporter1-device1-id");
    expect(uniqueLatestDevices.all[1].id.value).toBe("supporter2-device1-id");
    expect(uniqueLatestDevices.all[0].equals(uniqueLatestDevices.all[1])).toBe(false);
    expect(uniqueLatestDevices.all[0].ownerId.value).toBe("supporter1-id");
    expect(uniqueLatestDevices.all[1].ownerId.value).toBe("supporter2-id");
  });
});
