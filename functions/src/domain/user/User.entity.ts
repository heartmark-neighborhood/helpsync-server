import { UserId } from "./user-id.value";

export class User {
  constructor(
    readonly id: UserId,
    readonly name: string,
    readonly email: string,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}