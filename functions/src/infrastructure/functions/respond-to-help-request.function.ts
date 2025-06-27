import { https } from "firebase-functions";
import * as logger from "firebase-functions/logger"
import { z } from 'zod';
import { RespondToHelpRequestInputSchema } from "../../domain/help-request/respond-to-help-request.usecase";

const respondToHelpRequest = https.onCall(
    async (request) => {
        logger.info("Received create help request call", { uid: request.auth?.uid, data: request.data });
        if(!request.auth) {
            logger.error("Unauthorized request");
            throw new https.HttpsError("unauthenticated", "Unauthorized request");
        }

        const imput = RespondToHelpRequestInputSchema.parse(request.data)

    }
)