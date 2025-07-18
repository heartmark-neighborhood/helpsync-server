import {DeviceId} from "../../device/device-id.value.js";
import {UserInfo} from "../user-info.dto.js";

export interface IHelpRequestNotifier {
  notifyRequesterOfMatches(targetDeviceId: DeviceId, requesterInfo: UserInfo): Promise<void>;
  notifySupporterOfMatches(targetDeviceId: DeviceId, requesterInfos: UserInfo[]): Promise<void>;
}
