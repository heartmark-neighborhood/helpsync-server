import {DeviceId} from "../../device/device-id.value.js";
import {HelpRequestId} from "../help-request-id.value.js";
import {ProximityVerificationId} from "../proximity-verification-id.value.js";


export interface IProximityVerificationNotifier {
  send(targetDeviceId: DeviceId, helpRequestId: HelpRequestId, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void>;
}
