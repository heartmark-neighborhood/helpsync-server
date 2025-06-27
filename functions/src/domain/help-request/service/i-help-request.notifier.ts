import { DeviceId } from "../../device/device-id.value";
import { UserId } from "../../user/user-id.value";
import { RequesterProfileDto } from "../requester-profile.dto";

export interface IHelpRequestNotifier {
  send(targetDeviceId: DeviceId, requesterProfile: RequesterProfileDto): Promise<void>;
}