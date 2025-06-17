import { Message } from "firebase-admin/messaging";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";


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
    fcmToken: string,
    data: Record<string, any>
  ): Promise<void>{

    const message: Message = {
      token: fcmToken,
      data: data || {},
    };

    try{
      await admin.messaging().send(message);
      logger.info("Notification sent successfully", { fcmToken, data });
    } catch (error) {
      logger.error("Error sending notification", { fcmToken, error });
      throw new Error("Failed to send notification");
    }
  }
}