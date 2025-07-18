import {DeviceId} from "../../device/device-id.value.js";
import {ProximityVerificationId} from "../proximity-verification-id.value.js";


export interface IProximityVerificationNotifier {
  send(targetDeviceId: DeviceId, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void>;
}
