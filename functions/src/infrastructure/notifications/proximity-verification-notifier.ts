import { logger } from "firebase-functions";
import { ProximityVerificationId } from "../../domain/help-request/proximity-verification-id.value";
import { IProximityVerificationNotifier } from "../../domain/help-request/service/i-proximity-verification.notifier";
import { UserId } from "../../domain/user/user-id.value";
import { FcmGateway } from "./fcm-gateway";


export class ProximityVerificationNotifier implements IProximityVerificationNotifier {
  private gateway: FcmGateway;

  static create(gateway: FcmGateway): ProximityVerificationNotifier {
    return new ProximityVerificationNotifier(gateway);
  }

  private constructor(gateway: FcmGateway) {
    this.gateway = gateway;
  }

  async send(targetUserId: UserId, proximityVerificationId: ProximityVerificationId, expiredAt: Date): Promise<void> {
    const data = {
      proximityVerificationId: proximityVerificationId.value,
      expiredAt: expiredAt.toISOString(),
      type: "proximity-verification",
    };
    
    try {
      await this.gateway.sendNotification(targetUserId.value, data);
    } catch (error) {
      logger.error("Failed to send proximity verification notification:", error);
      throw new Error("Notification sending failed");
    }
  }
}