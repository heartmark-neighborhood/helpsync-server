import {RegisterNewDeviceUseCase} from "./register-new-device.usecase";
import {IDeviceRepository} from "./i-device.repository";
import {Device} from "./device.entity";
import {UserId} from "../user/user-id.value";
import {DeviceId} from "./device-id.value";
import {DeviceToken} from "./device-token.value";
import {Location} from "../shared/value-object/Location.value";
import {TestClock} from "../../../__test__/fake/test-clock.service";

import {MemoryDeviceRepository} from "../../../__test__/fake/memory-device.repository";

describe("RegisterNewDeviceUseCase", () => {
  let deviceRepository: IDeviceRepository;
  let registerNewDeviceUseCase: RegisterNewDeviceUseCase;
  let clock: TestClock;

  beforeEach(() => {
    deviceRepository = new MemoryDeviceRepository();
    clock = new TestClock();
    registerNewDeviceUseCase = RegisterNewDeviceUseCase.create(deviceRepository);
  });

  it("should register a new device successfully", async () => {
    const ownerId = UserId.create("user-123");
    const deviceId = DeviceId.create("device-456");
    const deviceToken = DeviceToken.create("sample-token");
    const location = Location.create({latitude: 37.7749, longitude: -122.4194});

    const command = {
      ownerId,
      deviceId,
      deviceToken,
      location,
      clock,
    };

    const device = await registerNewDeviceUseCase.execute(command);

    expect(device).toBeInstanceOf(Device);
    expect(device.ownerId).toEqual(ownerId);
    expect(device.deviceToken).toEqual(deviceToken);
    expect(device.location).toEqual(location);
    expect(device.lastUpdatedAt).toEqual(clock.now());
  });
});
