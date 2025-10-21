import {IClock} from "../shared/service/i-clock.service";
import {Device} from "./device.entity";
import {DeviceToken, DeviceTokenSchema} from "./device-token.value";
import {Location, LocationSchema} from "../shared/value-object/Location.value";
import {UserId, UserIdSchema} from "../user/user-id.value";
import {IDeviceRepository} from "./i-device.repository";
import {z} from "zod";

export const RegisterNewDeviceSchema = z.object({
  ownerId: UserIdSchema,
  deviceToken: DeviceTokenSchema,
  location: LocationSchema,
}).strict();

export type RegisterNewDeviceInput = z.infer<typeof RegisterNewDeviceSchema>;

export class RegisterNewDeviceCommand {
  private constructor(
    public readonly ownerId: UserId,
    public readonly deviceToken: DeviceToken,
    public readonly location: Location,
    public readonly clock: IClock,
  ) {}

  static create(
    ownerId: UserId,
    deviceToken: DeviceToken,
    location: Location,
    clock: IClock
  ): RegisterNewDeviceCommand {
    return new RegisterNewDeviceCommand(
      ownerId,
      deviceToken,
      location,
      clock
    );
  }
}

export class RegisterNewDeviceUseCase {
  private constructor(private deviceRepository: IDeviceRepository) {}

  static create(deviceRepository: IDeviceRepository): RegisterNewDeviceUseCase {
    return new RegisterNewDeviceUseCase(deviceRepository);
  }

  async execute(params: RegisterNewDeviceCommand): Promise<Device> {
    const lastUpdatedAt = params.clock.now();
    const deviceId = await this.deviceRepository.nextIdentity();

    const device = Device.create(
      deviceId,
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
