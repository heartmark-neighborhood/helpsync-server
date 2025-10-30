import {DeviceId} from "../../device/device-id.value.js";
import {DeviceToken} from "../../device/device-token.value.js";
import {UserInfo} from "../user-info.dto.js";

export interface IHelpRequestNotifier {
  notifyRequesterOfMatches(targetDeviceToken: DeviceToken, requesterInfo: UserInfo): Promise<void>;
  notifySupporterOfMatches(targetDeviceToken: DeviceToken, requesterInfos: UserInfo[]): Promise<void>;
}
