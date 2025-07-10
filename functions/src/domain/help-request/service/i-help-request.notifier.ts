import {DeviceId} from "../../device/device-id.value";
import {UserInfo} from "../user-info.dto";

export interface IHelpRequestNotifier {
  notifyRequesterOfMatches(targetDeviceId: DeviceId, requesterInfo: UserInfo): Promise<void>;
  notifySupporterOfMatches(targetDeviceId: DeviceId, requesterInfos: UserInfo[]): Promise<void>;
}
