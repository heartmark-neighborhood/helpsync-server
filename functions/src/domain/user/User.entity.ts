import {IClock} from "../shared/service/i-clock.service";
import {UserId} from "./user-id.value";

export class User {
  private constructor(
    readonly id: UserId,
    readonly nickname: string,
    readonly email: string,
    readonly role: "supporter" | "requester" = "requester",
    readonly isAvailableForHelp: boolean = true,
    readonly iconUrl: string = "path/to/icon.jpg",
    readonly physicalFeatures: string = "黒いリュックサックを背負っています。",

    readonly createdAt: Date,
    readonly updatedAt: Date,

    private readonly clock: IClock,
  ) {}

  static create(
    id: UserId,
    nickname = "hoge",
    email = "default@example.com",
    role: "supporter" | "requester" = "requester",
    iconUrl = "path/to/icon.jpg",
    physicalFeatures = "黒いリュックサックを背負っています。",
    createdAt: Date,
    updatedAt: Date,
    clock: IClock,
  ): User {
    return new User(id, nickname, email, role, true, iconUrl, physicalFeatures, createdAt, updatedAt, clock);
  }
}
