import {DeviceToken, DeviceTokenSchema} from "./device-token.value.js";
import {DeviceId, DeviceIdSchema} from "./device-id.value.js";
import {IDeviceRepository} from "./i-device.repository.js";
import {z} from "zod";

export const RenewDeviceTokenSchema = z.object({
  deviceId: DeviceIdSchema,
  deviceToken: DeviceTokenSchema,
});

export type RenewDeviceTokenInput = z.infer<typeof RenewDeviceTokenSchema>;

export class RenewDeviceTokenCommand {
  private constructor(
    public readonly deviceId: DeviceId,
    public readonly deviceToken: DeviceToken,
  ) {}

  static create(input: RenewDeviceTokenInput): RenewDeviceTokenCommand {
    const deviceId = DeviceId.create(input.deviceId);
    const deviceToken = DeviceToken.create(input.deviceToken);

    return new RenewDeviceTokenCommand(deviceId, deviceToken);
  }
}

export class RenewDeviceTokenUseCase {
  private constructor(private readonly repository: IDeviceRepository) {}
  static create(repository: IDeviceRepository): RenewDeviceTokenUseCase {
    return new RenewDeviceTokenUseCase(repository);
  }

  async execute(command: RenewDeviceTokenCommand): Promise<void> {
    const device = await this.repository.findById(command.deviceId);
    if (!device) {
      throw new Error(`Device with ID ${command.deviceId.value} not found`);
    }

    const updatedDevice = device.renewToken(command.deviceToken);
    await this.repository.save(updatedDevice);
  }
}
