import { UserId } from "../../user/user-id.value";
import { RequesterProfileDto } from "../requester-profile.dto";

export interface IHelpRequestNotifier {
  send(targetUserId: UserId, requesterProfile: RequesterProfileDto): Promise<void>;
}