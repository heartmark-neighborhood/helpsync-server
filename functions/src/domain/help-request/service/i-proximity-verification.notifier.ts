import { User } from "../../user/User.entity";
import { UserId } from "../../user/user-id.value";
import { ProximityVerificationId } from "../proximity-verification-id.value";


export interface IProximityVerificationNotifier {
  send(targetUserId: UserId, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void>;
}