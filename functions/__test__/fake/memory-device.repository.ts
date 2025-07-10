import {DeviceId} from "../../src/domain/device/device-id.value";
import {DeviceToken} from "../../src/domain/device/device-token.value";
import {Device} from "../../src/domain/device/device.entity";
import {DevicesCollection} from "../../src/domain/device/devices.collection";
import {IDeviceRepository} from "../../src/domain/device/i-device.repository";
import {UserId} from "../../src/domain/user/user-id.value";
import {TestClock} from "./test-clock.service";
import {Location} from "../../src/domain/shared/value-object/Location.value";

export class MemoryDeviceRepository implements IDeviceRepository {
  private devices: Device[] = [];

  private testClock = new TestClock();


  private _requesterDevice = Device.create(
    DeviceId.create("requester-device-id"),
    UserId.create("requester-id"),
    DeviceToken.create("requester-device-token"),
    Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
    this.testClock.now(),
    this.testClock
  );

  private supporter1Device1 = Device.create(
    DeviceId.create("supporter1-device1-id"),
    UserId.create("supporter1-id"),
    DeviceToken.create("supporter1-device-token"),
    Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
    new Date(2023, 10, 1, 12, 0, 0), // Example date
    this.testClock
  );
  private supporter1Device2 = Device.create(
    DeviceId.create("supporter1-device2-id"),
    UserId.create("supporter1-id"),
    DeviceToken.create("supporter1-device-token"),
    Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
    new Date(2023, 10, 1, 11, 0, 0), // Example date
    this.testClock
  );
  private supporter1Device3 = Device.create(
    DeviceId.create("supporter1-device3-id"),
    UserId.create("supporter1-id"),
    DeviceToken.create("supporter1-device-token"),
    Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
    new Date(2023, 10, 1, 10, 0, 0), // Example date
    this.testClock
  );
  private supporter2Device1 = Device.create(
    DeviceId.create("supporter2-device1-id"),
    UserId.create("supporter2-id"),
    DeviceToken.create("supporter2-device-token"),
    Location.create({latitude: 35.6895, longitude: 139.6917}), // Tokyo
    new Date(2023, 10, 1, 12, 0, 0), // Example date
    this.testClock
  );

  constructor() {
    // Initialize with some dummy devices
    this.devices.push(this._requesterDevice);
    this.devices.push(this.supporter1Device1);
    this.devices.push(this.supporter1Device2);
    this.devices.push(this.supporter1Device3);
    this.devices.push(this.supporter2Device1);
  }

  get requesterDevice(): Device {
    return this._requesterDevice;
  }

  async save(device: Device): Promise<Device> {
    const index = this.devices.findIndex((d) => d.equals(device));
    if (index !== -1) {
      this.devices[index] = device;
    } else {
      this.devices.push(device);
    }
    return device;
  }

  async findAvailableNearBy(center: Location, radiusInM: number): Promise<DevicesCollection> {
    return DevicesCollection.create([
      this.supporter1Device1,
      this.supporter1Device2,
      this.supporter1Device3,
      this.supporter2Device1,
    ]);
  }

  async findById(deviceId: DeviceId): Promise<Device | null> {
    const device = this.devices.find((d) => d.id.equals(deviceId));
    return device || null;
  }
}
