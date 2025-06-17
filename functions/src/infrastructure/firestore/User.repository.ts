import { IUserRepository } from "../../domain/user/i-user.repository"; 
import { User } from "../../domain/user/User.entity";
import { UserId } from "../../domain/user/user-id.value";
import { Location } from "../../domain/shared/value-object/Location.value";

export class UserRepository implements IUserRepository {
  private db: FirebaseFirestore.Firestore;

  static create(db: FirebaseFirestore.Firestore): UserRepository {
    return new UserRepository(db);
  }

  private constructor(db: FirebaseFirestore.Firestore) {
    this.db = db;
  }

  async save(user: User): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async findById(id: UserId): Promise<User | null> {
    throw new Error("Method not implemented.");
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }

  async findAvailableSupporters(location: Location, radiusInM: number): Promise<User[]> {
    throw new Error("Method not implemented.");
  }

  async delete(user: User): Promise<void> {
    throw new Error("Method not implemented.");
  }
}