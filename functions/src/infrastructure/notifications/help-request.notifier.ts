import { IHelpRequestNotifier } from "../../domain/help-request/service/i-help-request.notifier";
import { RequesterProfileDto } from "../../domain/help-request/requester-profile.dto";

import { FcmGateway } from "./fcm-gateway";
import { DeviceId } from "../../domain/device/device-id.value";
import { logger } from "firebase-functions";


class HelpRequestNotifier implements IHelpRequestNotifier {
  private gateway: FcmGateway;

  static create(gateway: FcmGateway): HelpRequestNotifier {
    return new HelpRequestNotifier(gateway);
  }

  private constructor(gateway: FcmGateway) {
    this.gateway = gateway;
  }

  async send(targetDeviceId: DeviceId, requesterProfile: RequesterProfileDto): Promise<void> {
    const data = {
      nickname: requesterProfile.nickname,
      iconUrl: requesterProfile.iconUrl,
      physicalDescription: requesterProfile.physicalDescription,
    }

    try {
      await this.gateway.sendNotification(targetDeviceId, data);
    } catch (error) {
      logger.error("Failed to send help request notification:", error);
      throw new Error("Notification sending failed");
    }
  }
}

