import { IClock } from "../shared/service/i-clock.service";
import { Location } from "../shared/value-object/Location.value";
import { UserId } from "./user-id.value";

export class User {
  private constructor(
    readonly id: UserId,
    readonly nickname: string,
    readonly email: string,
    readonly role: 'supporter' | 'requester' = 'requester',
    readonly isAvailableForHelp: boolean = true,
    readonly location: Location = Location.create({latitude: 0, longitude: 0}), // Default location
    readonly iconUrl: string = "path/to/icon.jpg",
    readonly physicalFeatures: string = "黒いリュックサックを背負っています。",

    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  static create(
    id: UserId, 
    name: string = "hoge", 
    role: 'supporter' | 'requester' = 'requester',
    email: string = "default@example.com", 
    iconUrl: string = "path/to/icon.jpg", 
    physicalFeatures: string = "黒いリュックサックを背負っています。",
    clock: IClock = { now: () => new Date() }
  ): User {
    const now = clock.now();
    return new User(id, name, email, role, true, Location.create({latitude: 0, longitude: 0}), iconUrl, physicalFeatures, now, now);
  }
}