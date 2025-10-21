import {MemoryDeviceRepository} from "../../../__test__/fake/memory-device.repository";
import {DeleteDeviceUseCase, DeleteDeviceCommand} from "./delete-device.usecase";
import {DeviceId} from "./device-id.value";
import {DeviceToken} from "./device-token.value";
import {UserId} from "../user/user-id.value";
import {Device} from "./device.entity";
import {TestClock} from "../../../__test__/fake/test-clock.service";
import {Location} from "../shared/value-object/Location.value";

describe("DeleteDeviceUseCase", () => {
  let deviceRepository: MemoryDeviceRepository;
  let deleteDeviceUseCase: DeleteDeviceUseCase;

  beforeEach(() => {
    deviceRepository = new MemoryDeviceRepository();
    deleteDeviceUseCase = DeleteDeviceUseCase.create(deviceRepository);
  });

  it("should delete a device successfully", async () => {
    const ownerId = UserId.create("user-123");
    const deviceId = DeviceId.create("device-123");
    const deviceToken = DeviceToken.create("token-123");
    const location = Location.create({latitude: 10, longitude: 20});
    const clock = new TestClock();
    const device = Device.create(
      deviceId,
      ownerId,
      deviceToken,
      location,
      clock.now(),
      clock,
    );
    await deviceRepository.save(device);

    const command = DeleteDeviceCommand.create(deviceId, ownerId);
    await deleteDeviceUseCase.execute(command);

    const deletedDevice = await deviceRepository.findById(deviceId);
    expect(deletedDevice).toBeNull();
  });

  it("should throw an error if the device does not exist", async () => {
    const command = DeleteDeviceCommand.create(
      DeviceId.create("non-existent-device"),
      UserId.create("user-123"),
    );

    await expect(deleteDeviceUseCase.execute(command)).rejects.toThrow(
      /Device with ID non-existent-device not found/,
    );
  });

  it("should throw an error if the user is not authorized to delete the device", async () => {
    const ownerId = UserId.create("user-123");
    const otherUserId = UserId.create("user-456");
    const deviceId = DeviceId.create("device-123");
    const deviceToken = DeviceToken.create("token-123");
    const location = Location.create({latitude: 0, longitude: 0});
    const clock = new TestClock();
    const device = Device.create(
      deviceId,
      ownerId,
      deviceToken,
      location,
      clock.now(),
      clock,
    );
    await deviceRepository.save(device);

    const command = DeleteDeviceCommand.create(deviceId, otherUserId);

    await expect(deleteDeviceUseCase.execute(command)).rejects.toThrow(
      /is not authorized to delete device/,
    );
  });
});
