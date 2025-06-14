import { z } from 'zod';

const UserIdSchema = z
  .string({
    required_error: 'User ID is required.',
    invalid_type_error: 'User ID must be a string.',
  })
  .min(1, { message: 'User ID cannot be empty.' }) 
  .max(128, { message: 'User ID is too long.' }); 


export class UserId {
  private constructor(readonly value: string) {}

  static create(value: string): UserId {
    UserIdSchema.parse(value);
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}