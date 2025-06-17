import { User } from "./User.entity";
import { UserId } from "./user-id.value";
import { Location } from "../shared/value-object/Location.value";


export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAvailableSupporters(location: Location, radiusInM: number): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(user: User): Promise<void>;
}