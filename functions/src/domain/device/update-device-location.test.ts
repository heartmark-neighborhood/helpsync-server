import { MemoryDeviceRepository } from "../../../__test__/fake/memory-device.repository";
import { Location } from "../shared/value-object/Location.value";
import { DeviceId } from "./device-id.value";
import { UpdateDeviceLocationCommand, UpdateDeviceLocationInputSchema, UpdateDeviceLocationUseCase } from "./update-device-location.usecase";

describe('デバイスの位置情報更新', () => {
  it('正常な位置情報更新', async () => {
    const repository = new MemoryDeviceRepository();
    const usecase = UpdateDeviceLocationUseCase.create(repository);

    const deviceId = 'supporter1-device1-id';
    const newLocation = Location.create({
      latitude: 23,
      longitude: 42.195,
    });
    const commandData = UpdateDeviceLocationInputSchema.parse({
      deviceId,
      location: newLocation,
    });

    const command = UpdateDeviceLocationCommand.create(commandData);
    await usecase.execute(command);

    const updatedDevice = await repository.findById(DeviceId.create(deviceId));
    expect(updatedDevice).toBeDefined();
    expect(updatedDevice?.location.equals(newLocation)).toBe(true); 
  });
});