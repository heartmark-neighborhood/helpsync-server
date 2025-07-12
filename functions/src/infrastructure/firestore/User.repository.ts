import {IUserRepository} from "../../domain/user/i-user.repository";
import {User} from "../../domain/user/User.entity";
import {UserId} from "../../domain/user/user-id.value";
import {IClock} from "../../domain/shared/service/i-clock.service";

import {z} from "zod";

import {DocumentSnapshot, Timestamp} from "firebase-admin/firestore";

export const UserSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  email: z.string().email(),
  role: z.enum(["supporter", "requester"]),
  isAvailableForHelp: z.boolean(),
  iconUrl: z.string().url(),
  physicalFeatures: z.string(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export class UserRepository implements IUserRepository {
  private db: FirebaseFirestore.Firestore;
  private clock: IClock;

  static create(db: FirebaseFirestore.Firestore, clock: IClock): UserRepository {
    return new UserRepository(db, clock);
  }

  private constructor(db: FirebaseFirestore.Firestore, clock: IClock) {
    this.db = db;
    this.clock = clock;
  }

  async save(user: User): Promise<User> {
    const docRef = this.db.collection("users").doc(user.id.toString());
    await docRef.set({
      id: user.id.toString(),
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      isAvailableForHelp: user.isAvailableForHelp,
      iconUrl: user.iconUrl,
      physicalFeatures: user.physicalFeatures,
      createdAt: Timestamp.fromDate(user.createdAt),
      updatedAt: Timestamp.fromDate(user.updatedAt),
    }, {merge: true});
    return user;
  }

  async findById(id: UserId): Promise<User | null> {
    const docRef = this.db.collection("users").doc(id.toString());
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    }
    return this.toEntity(doc);
  }

  async findManyByIds(ids: UserId[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }
    const queuery = this.db.collection("users").where("id", "in", ids);
    const snapshot = await queuery.get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => this.toEntity(doc));
  }

  private toEntity(data: DocumentSnapshot): User {
    const parsedData = UserSchema.parse(data.data());
    return User.create(
      UserId.create(parsedData.id),
      parsedData.nickname,
      parsedData.email,
      parsedData.role,
      parsedData.iconUrl,
      parsedData.physicalFeatures,
      parsedData.createdAt.toDate(),
      parsedData.updatedAt.toDate(),
      this.clock
    );
  }
}
