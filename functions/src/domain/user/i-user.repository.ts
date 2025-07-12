import {User} from "./User.entity";
import {UserId} from "./user-id.value";

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findManyByIds(ids: UserId[]): Promise<User[]>;
  save(user: User): Promise<User>;
}
