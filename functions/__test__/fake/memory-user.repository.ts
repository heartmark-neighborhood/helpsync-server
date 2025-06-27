import { IUserRepository } from '../../src/domain/user/i-user.repository';
import { User } from '../../src/domain/user/User.entity';
import { UserId } from '../../src/domain/user/user-id.value';
import { Location } from '../../src/domain/shared/value-object/Location.value';
import { TestClock } from './test-clock.service';

export class MemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private requester = User.create(
    UserId.create('requester-id'),
    'hogehoge',
    'requester@example.com',
    'requester',
    'path/to/requester/icon.jpg',
    '黒いリュックサックを背負っています。',
    new TestClock()
  );

  private supporter1 = User.create(
    UserId.create('supporter1-id'),
    'supporter1',
    'supporter1@example.com',
    'supporter',
    'path/to/supporter1/icon.jpg',
    '白い帽子をかぶっています。',
    new TestClock()
  );

  private supporter2 = User.create(
    UserId.create('supporter2-id'),
    'supporter2',
    'supporter2@example.com',
    'supporter',
    'path/to/supporter2/icon.jpg',
    '黄色いTシャツを着ています。',
    new TestClock()
  );

  constructor() {
    // Initialize with some dummy data if needed
    this.users.push(this.requester);
    this.users.push(this.supporter1);
    this.users.push(this.supporter2);
  }
  async save(user: User): Promise<User> {
    const index = this.users.findIndex(u => u.id.equals(user.id));
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    return user;
  }
  async findById(id: UserId): Promise<User | null> {
    const user = this.users.find(u => u.id.equals(id));
    return user || null;
  }

  async delete(user: User): Promise<void> {
    this.users = this.users.filter(u => !u.id.equals(user.id));
  }

  async findAvailableSupporters(location: Location, radiusInM: number): Promise<User[]> {
    return [this.supporter1, this.supporter2];
  }
}