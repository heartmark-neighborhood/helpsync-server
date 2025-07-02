import { getFirestore } from "firebase-admin/firestore";
import { https, logger } from "firebase-functions";
import  { ProximityVerificationTimeoutCommand, ProximityVerificationTimeoutInputSchema, ProximityVerificationTimeoutUseCase } from "../../domain/help-request/on-proximity-verification-timeout.usecase";import { HelpRequestRepository } from "../firestore/help-request.repository";
import { SystemClock } from "../service/SystemClock";
import { HelpRequestNotifier } from "../notifications/help-request.notifier";
import { FcmGateway } from "../notifications/fcm-gateway";

export const onProximityVerificationTimeout = https.onRequest(
  async (request, response) => {
    if (request.method !== "POST") {
      logger.error("Invalid request method", { method: request.method });
      response.status(405).send("Method Not Allowed");
      return;
    }

    if (!request.body || !request.body.helpRequestId) {
      logger.error("Missing helpRequestId in request body");
      response.status(400).send("Missing helpRequestId in request body");
      return;
    }
    
    logger.info("Received proximity verification timeout request", { body: request.body });

    try {
      const input = ProximityVerificationTimeoutInputSchema.parse(request.body);
      const command = ProximityVerificationTimeoutCommand.create(input);

      const db = getFirestore();
      const clock = SystemClock.create();
      const helpRequestRepository = HelpRequestRepository.create(db, clock);
      
      const gateway = FcmGateway.create();
      const notifier = HelpRequestNotifier.create(gateway);

      const usecase = ProximityVerificationTimeoutUseCase.create(helpRequestRepository, notifier);
      await usecase.execute(command);
    } catch (error) {
      logger.error("Error processing proximity verification timeout", { error });
      response.status(500).send("Internal server error");
      return;
    }

    response.status(200).send("Proximity verification timeout processed successfully");
  }
);