import { Location } from "../shared/value-object/Location.value";
import { DeviceToken } from "./device-token.value";
import { UserId } from "../user/user-id.value";
import { IClock } from "../shared/service/i-clock.service";
import { DeviceId } from "./device-id.value";

export class Device{
  private constructor(
    readonly id: DeviceId,
    readonly ownerId: UserId,
    readonly deviceToken: DeviceToken,
    readonly location: Location, 
    readonly lastUpdatedAt: Date,
    readonly clock: IClock
  ) {}

  static create(
    id: DeviceId,
    ownerId: UserId,
    deviceToken: DeviceToken,
    location: Location = Location.create({ latitude: 0, longitude: 0 }), // Default location
    lastSeen: Date,
    clock: IClock
  ): Device {
    return new Device(id, ownerId, deviceToken, location, lastSeen, clock);
  }

  equals(other: Device): boolean {
    return this.id.equals(other.id);
  }

  moveTo(location: Location): Device {
    return new Device(
      this.id,
      this.ownerId,
      this.deviceToken,
      location,
      this.clock.now(),
      this.clock
    );
  }
}