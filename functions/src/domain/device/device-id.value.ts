import { z } from 'zod';

// Define a Zod schema for validating device IDs
export const DeviceIdSchema = z.string().min(1, 'Device ID must not be empty');

export class DeviceId {
  private constructor(
    public readonly value: string,
  ) {}

  static create(value: string): DeviceId {
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid device ID');
    }
    return new DeviceId(value);
  }

  static null(): DeviceId {
    return new DeviceId('');
  }

  isNull(): boolean {
    return this.value === '';
  }

  toString(): string {
    return this.value;
  }

  equals(other: DeviceId): boolean {
    return this.value === other.value;
  }
}