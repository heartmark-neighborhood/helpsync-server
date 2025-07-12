import {Location} from "../shared/value-object/Location.value";
import {DeviceId} from "./device-id.value";
import {Device} from "./device.entity";
import {DevicesCollection} from "./devices.collection";

export interface IDeviceRepository {
  save(device: Device): Promise<Device>;
  findAvailableNearBy(
    location: Location,
    radiusInM: number
  ): Promise<DevicesCollection>;
  findById(deviceId: DeviceId): Promise<Device | null>;
}
