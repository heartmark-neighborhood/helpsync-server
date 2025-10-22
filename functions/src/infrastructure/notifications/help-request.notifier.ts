import {IHelpRequestNotifier} from "../../domain/help-request/service/i-help-request.notifier";
import {FcmGateway} from "./fcm-gateway";
import {logger} from "firebase-functions";
import {UserInfo} from "../../domain/help-request/user-info.dto";
import {DeviceToken} from "../../domain/device/device-token.value";


export class HelpRequestNotifier implements IHelpRequestNotifier {
  private gateway: FcmGateway;

  static create(gateway: FcmGateway): HelpRequestNotifier {
    return new HelpRequestNotifier(gateway);
  }

  private constructor(gateway: FcmGateway) {
    this.gateway = gateway;
  }

  async notifyRequesterOfMatches(targetDeviceToken: DeviceToken, requesterInfo: UserInfo): Promise<void> {
    const data = {
      type: "help-request",
      data: JSON.stringify({
        requester: {
          id: requesterInfo.id,
          nickname: requesterInfo.nickname,
          iconUrl: requesterInfo.iconUrl,
          physicalDescription: requesterInfo.physicalDescription,
        },
      }),
    };

    try {
      await this.gateway.sendNotification(targetDeviceToken, data);
    } catch (error) {
      logger.error("Failed to send help request notification:", error);
      throw new Error("Notification sending failed");
    }
  }

  async notifySupporterOfMatches(targetDeviceToken: DeviceToken, candidatesInfo: UserInfo[]): Promise<void> {
    const data = {
      type: "help-request",
      data: JSON.stringify({
        candidates: candidatesInfo.map((candidate) => ({
          id: candidate.id,
          nickname: candidate.nickname,
          iconUrl: candidate.iconUrl,
          physicalDescription: candidate.physicalDescription,
        })),
      }),
    };

    try {
      await this.gateway.sendNotification(targetDeviceToken, data);
    } catch (error) {
      logger.error("Failed to send help request notification:", error);
      throw new Error("Notification sending failed");
    }
  }
}

