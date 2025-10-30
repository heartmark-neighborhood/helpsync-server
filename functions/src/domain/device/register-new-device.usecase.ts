import {IClock} from "../shared/service/i-clock.service";
import {Device} from "./device.entity";
import {DeviceToken, DeviceTokenSchema} from "./device-token.value";
import {Location, LocationSchema} from "../shared/value-object/Location.value";
import {UserId, UserIdSchema} from "../user/user-id.value";
import {IDeviceRepository} from "./i-device.repository";
import {z} from "zod";
import {logger} from "firebase-functions";

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
    logger.info("Executing RegisterNewDeviceUseCase with params:", params);

    const lastUpdatedAt = params.clock.now();
    logger.info("Generated lastUpdatedAt:", lastUpdatedAt);

    const deviceId = await this.deviceRepository.nextIdentity();
    logger.info("Generated deviceId:", deviceId);

    const device = Device.create(
      deviceId,
      params.ownerId,
      params.deviceToken,
      params.location,
      lastUpdatedAt,
      params.clock
    );
    logger.info("Created device entity:", device);

    await this.deviceRepository.save(device);
    logger.info("Successfully saved device to repository.");

    return device;
  }
}
