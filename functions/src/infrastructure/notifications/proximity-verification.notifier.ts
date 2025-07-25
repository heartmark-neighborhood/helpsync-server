import {logger} from "firebase-functions";
import {ProximityVerificationId} from "../../domain/help-request/proximity-verification-id.value";
import {IProximityVerificationNotifier} from "../../domain/help-request/service/i-proximity-verification.notifier";
import {FcmGateway} from "./fcm-gateway";
import {DeviceId} from "../../domain/device/device-id.value";


export class ProximityVerificationNotifier implements IProximityVerificationNotifier {
  private gateway: FcmGateway;

  static create(gateway: FcmGateway): ProximityVerificationNotifier {
    return new ProximityVerificationNotifier(gateway);
  }

  private constructor(gateway: FcmGateway) {
    this.gateway = gateway;
  }

  async send(targetDeviceId: DeviceId, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void> {
    const data = {
      type: "proximity-verification",
      data: JSON.stringify({
        proximityVerificationId: proximityVerificationId.value,
        expiredAt: expiredAt.toISOString(),
      }),
    };

    try {
      await this.gateway.sendNotification(targetDeviceId, data);
    } catch (error) {
      logger.error("Failed to send proximity verification notification:", error);
      throw new Error("Notification sending failed");
    }
  }
}
