import {z} from "zod";

export const UserIdSchema = z
  .string({
    required_error: "User ID is required.",
    invalid_type_error: "User ID must be a string.",
  })
  .min(1, {message: "User ID cannot be empty."})
  .max(128, {message: "User ID is too long."});

export type UserIdPersistenceModel = z.infer<typeof UserIdSchema>;


export class UserId {
  private constructor(readonly value: string) {}

  static create(value: UserIdPersistenceModel): UserId {
    UserIdSchema.parse(value);
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
