import {Location} from "../shared/value-object/Location.value.js";
import {DeviceId} from "./device-id.value.js";
import {Device} from "./device.entity.js";
import {DevicesCollection} from "./devices.collection.js";

export interface IDeviceRepository {
  save(device: Device): Promise<Device>;
  findAvailableNearBy(
    location: Location,
    radiusInM: number
  ): Promise<DevicesCollection>;
  findById(deviceId: DeviceId): Promise<Device | null>;
  nextIdentity(): Promise<DeviceId>;
  delete(deviceId: DeviceId): Promise<void>;
}
