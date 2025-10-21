import {IClock} from "../shared/service/i-clock.service";
import {Device} from "./device.entity";
import {DeviceId, DeviceIdSchema} from "./device-id.value";
import {DeviceToken, DeviceTokenSchema} from "./device-token.value";
import {Location, LocationSchema} from "../shared/value-object/Location.value";
import {UserId, UserIdSchema} from "../user/user-id.value";
import {IDeviceRepository} from "./i-device.repository";
import {z} from "zod";

export const RegisterNewDeviceSchema = z.object({
  ownerId: UserIdSchema,
  deviceId: DeviceIdSchema,
  deviceToken: DeviceTokenSchema,
  location: LocationSchema,
}).strict();

export type RegisterNewDeviceInput = z.infer<typeof RegisterNewDeviceSchema>;

export class RegisterNewDeviceCommand {
  private constructor(
    public readonly ownerId: UserId,
    public readonly deviceId: DeviceId,
    public readonly deviceToken: DeviceToken,
    public readonly location: Location,
    public readonly clock: IClock,
  ) {}

  static create(
    ownerId: UserId,
    deviceId: DeviceId,
    deviceToken: DeviceToken,
    location: Location,
    clock: IClock
  ): RegisterNewDeviceCommand {
    return new RegisterNewDeviceCommand(
      ownerId,
      deviceId,
      deviceToken,
      location,
      clock
    );
  }
}

export class RegisterNewDeviceUseCase {
  constructor(private deviceRepository: IDeviceRepository) {}

  async execute(params: RegisterNewDeviceCommand): Promise<Device> {
    const lastUpdatedAt = params.clock.now();
    const device = Device.create(
      params.deviceId,
      params.ownerId,
      params.deviceToken,
      params.location,
      lastUpdatedAt,
      params.clock
    );

    await this.deviceRepository.save(device);

    return device;
  }
}
