import { z } from 'zod';

export const DeviceTokenSchema = z.string().min(1, 'Device token must not be empty');

export class DeviceToken {
  private constructor(
    public readonly value: string,
  ) {}

  static create(value: string): DeviceToken {
    if (!value || typeof value !== "string") {
      throw new Error("Invalid device token");
    }
    return new DeviceToken(value);
  }

  toString(): string {
    return this.value;
  }
}
