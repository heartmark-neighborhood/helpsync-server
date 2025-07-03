import { Device } from "./device.entity";

export class DevicesCollection {
  private devices: Device[] = [];

  add(device: Device): void {
    this.devices.push(device);
  }

  addAll(devices: Device[]): void {
    devices.forEach(device => this.add(device));
  }

  toUniqueLatest(): DevicesCollection {
    const uniqueDevices = new Map<String, Device>();
    this.devices.forEach(device => {
      const existingDevice = uniqueDevices.get(device.ownerId.value);
      if (!existingDevice || device.lastUpdatedAt > existingDevice.lastUpdatedAt) {
        uniqueDevices.set(device.ownerId.value, device);
      }
    });
    const collection = DevicesCollection.create();
    collection.addAll(Array.from(uniqueDevices.values()));
    return collection;
  }

  get length(): number {
    return this.devices.length;
  }

  get all(): readonly Device[] {
    return this.devices;
  }

  private constructor(devices: Device[]) {
    this.devices = devices;
  }

  static create(devices: Device[] = []): DevicesCollection {
    return new DevicesCollection(devices);
  }

}