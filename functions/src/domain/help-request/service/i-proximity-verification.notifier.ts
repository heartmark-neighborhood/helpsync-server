import {DeviceId} from "../../device/device-id.value";
import {ProximityVerificationId} from "../proximity-verification-id.value";


export interface IProximityVerificationNotifier {
  send(targetDeviceId: DeviceId, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void>;
}
