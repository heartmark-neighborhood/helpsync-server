import {UserId} from "../user/user-id.value";
import {DeviceId, DeviceIdSchema} from "./device-id.value";
import {IDeviceRepository} from "./i-device.repository.js";
import {z} from "zod";

export const DeleteDeviceInputSchema = z.object({
  deviceId: DeviceIdSchema,
}).strict();

export type DeleteDeviceInput = z.infer<typeof DeleteDeviceInputSchema>;

export class DeleteDeviceCommand {
  private constructor(public readonly deviceId: DeviceId, public readonly userId: UserId) {}

  static create(deviceId: DeviceId, userId: UserId): DeleteDeviceCommand {
    return new DeleteDeviceCommand(deviceId, userId);
  }
}

export class DeleteDeviceUseCase {
  private constructor(private readonly repository: IDeviceRepository) {}
  static create(repository: IDeviceRepository): DeleteDeviceUseCase {
    return new DeleteDeviceUseCase(repository);
  }

  async execute(command: DeleteDeviceCommand): Promise<void> {
    const device = await this.repository.findById(command.deviceId);
    if (!device) {
      throw new Error(`Device with ID ${command.deviceId.value} not found`);
    }

    if (device.ownerId?.value !== command.userId.value) {
      throw new Error(`User with ID ${command.userId.value} is not authorized to delete device with ID ${command.deviceId.value}`);
    }

    await this.repository.delete(command.deviceId);

    return;
  }
}
