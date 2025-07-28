import {User} from "./User.entity.js";
import {UserId} from "./user-id.value.js";

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findManyByIds(ids: UserId[]): Promise<User[]>;
  save(user: User): Promise<User>;
}
