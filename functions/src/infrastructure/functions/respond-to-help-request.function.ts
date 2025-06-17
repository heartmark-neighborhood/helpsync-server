import { https } from "firebase-functions";
import * as logger from "firebase-functions/logger"

const respondToHelpRequest = https.onCall(
    async (request) => {
    logger.info("Received create help request call", { uid: request.auth?.uid, data: request.data });
    if(!request.auth) {
      logger.error("Unauthorized request");
      throw new https.HttpsError("unauthenticated", "Unauthorized request");
    }
    }
)