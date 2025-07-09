import { Location, LocationSchema } from "../shared/value-object/Location.value";
import { DeviceId, DeviceIdSchema } from "./device-id.value";
import { IDeviceRepository } from "./i-device.repository";
import { z } from "zod";

export const UpdateDeviceLocationInputSchema = z.object({
  deviceId: DeviceIdSchema,
  location: LocationSchema,
});

export type UpdateDeviceLocationInput = z.infer<typeof UpdateDeviceLocationInputSchema>;

export class UpdateDeviceLocationCommand {
  private constructor(
    public readonly deviceId: DeviceId,
    public readonly location: Location,
  ) {}

  static create(input: UpdateDeviceLocationInput): UpdateDeviceLocationCommand {
    const deviceId = DeviceId.create(input.deviceId);
    const location = Location.create(input.location);

    return new UpdateDeviceLocationCommand(deviceId, location);
  }
}


export class UpdateDeviceLocationUseCase {
  private constructor(private readonly repository: IDeviceRepository) {}
  static create(repository: IDeviceRepository): UpdateDeviceLocationUseCase {
    return new UpdateDeviceLocationUseCase(repository);
  }

  async execute(command: UpdateDeviceLocationCommand): Promise<void> {
    const device = await this.repository.findById(command.deviceId);
    if (!device) {
      throw new NotFoundError(`Device with ID ${command.deviceId.value} not found`);
    }

    const updatedDevice = device.movedTo(command.location);
    await this.repository.save(updatedDevice);
  }
}