import { Message } from "firebase-admin/messaging";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { DeviceToken } from "../../domain/device/device-token.value";


export class FcmGateway {
  public static create(): FcmGateway {
    return new FcmGateway();
  }
  private constructor() {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp();
    }
  }
  public async sendNotification(
    deviceToken: DeviceToken,
    data: Record<string, any>
  ): Promise<void>{

    const message: Message = {
      token: deviceToken.toString(),
      data: data || {},
    };

    try{
      await admin.messaging().send(message);
      logger.info("Notification sent successfully", { fcmToken: deviceToken, data });
    } catch (error) {
      logger.error("Error sending notification", { fcmToken: deviceToken, error });
      throw new Error("Failed to send notification");
    }
  }
}