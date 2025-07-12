import {IUserRepository} from "../../src/domain/user/i-user.repository";
import {User} from "../../src/domain/user/User.entity";
import {UserId} from "../../src/domain/user/user-id.value";
import {TestClock} from "./test-clock.service";

export class MemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private readonly clock: TestClock = new TestClock();
  private requester = User.create(
    UserId.create("requester-id"),
    "hogehoge",
    "requester@example.com",
    "requester",
    "path/to/requester/icon.jpg",
    "黒いリュックサックを背負っています。",
    this.clock.now(),
    this.clock.now(),
    this.clock
  );

  private supporter1 = User.create(
    UserId.create("supporter1-id"),
    "supporter1",
    "supporter1@example.com",
    "supporter",
    "path/to/supporter1/icon.jpg",
    "白い帽子をかぶっています。",
    this.clock.now(),
    this.clock.now(),
    this.clock
  );

  private supporter2 = User.create(
    UserId.create("supporter2-id"),
    "supporter2",
    "supporter2@example.com",
    "supporter",
    "path/to/supporter2/icon.jpg",
    "黄色いTシャツを着ています。",
    this.clock.now(),
    this.clock.now(),
    this.clock
  );

  constructor() {
    // Initialize with some dummy data if needed
    this.users.push(this.requester);
    this.users.push(this.supporter1);
    this.users.push(this.supporter2);
  }

  get requesterUser(): User {
    return this.requester;
  }

  async save(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id.equals(user.id));
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    return user;
  }

  async findById(id: UserId): Promise<User | null> {
    const user = this.users.find((u) => u.id.equals(id));
    return user || null;
  }

  async findManyByIds(ids: UserId[]): Promise<User[]> {
    return this.users.filter((user) => ids.some((id) => user.id.equals(id)));
  }
}
