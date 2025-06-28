import { DeviceId } from "../device/device-id.value";
import { UserId } from "../user/user-id.value";

export interface RequesterInfo {
  id: UserId;
  nickname: string;
  iconUrl: string;
  deviceId: DeviceId;
}