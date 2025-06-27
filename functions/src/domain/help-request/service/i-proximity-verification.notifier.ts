import { Device } from "../../device/device.entity";
import { UserId } from "../../user/user-id.value";
import { ProximityVerificationId } from "../proximity-verification-id.value";


export interface IProximityVerificationNotifier {
  send(targetDevice: Device, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void>;
}