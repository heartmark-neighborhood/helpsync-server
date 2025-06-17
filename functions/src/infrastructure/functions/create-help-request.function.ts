import { https } from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";

import { z } from "zod";

import { CreateHelpRequestInputSchema } from "../../domain/help-request/create-help-request.usecase";
import { CreateHelpRequestCommand, CreateHelpRequestUseCase } from "../../domain/help-request/create-help-request.usecase";
import { HelpRequestRepository } from "../firestore/help-request.repository";
import { UserRepository } from "../firestore/User.repository";
import { FcmGateway } from "../notifications/fcm-gateway";
import { ProximityVerificationNotifier } from "../notifications/proximity-verification-notifier";
import { UserId } from "../../domain/user/user-id.value";
import { Location } from "../../domain/shared/value-object/Location.value";
import { SystemClock } from "../service/SystemClock";


export const createHelpRequest = https.onCall(
  async (request) => {
    logger.info("Received create help request call", { uid: request.auth?.uid, data: request.data });
    if(!request.auth) {
      logger.error("Unauthorized request");
      throw new https.HttpsError("unauthenticated", "Unauthorized request");
    }

    try {
      const db = getFirestore();
      const helpRequestRepository = HelpRequestRepository.create(db);
      const userRepository = UserRepository.create(db);
      const notifier = ProximityVerificationNotifier.create(FcmGateway.create());

      const usecase = CreateHelpRequestUseCase.create(
        helpRequestRepository,
        userRepository,
        notifier
      );

      const requesterId = UserId.create(request.auth.uid);
      const input = CreateHelpRequestInputSchema.parse(request.data);
      const location = Location.create(input.location);
      const clock = SystemClock.create();

      const command = CreateHelpRequestCommand.create(
        requesterId,
        location,
        clock
      );

      const helpRequest = await usecase.execute(command);
      logger.info("Help request created successfully", { uid: request.auth.uid, helpRequestId: helpRequest.id });

    } catch (error) {

      if (error instanceof z.ZodError) {
        logger.warn('Validation error:', { uid: request.auth?.uid, errors: error.errors });
        throw new https.HttpsError('invalid-argument', 'The data provided is invalid.');
      }

      logger.error('Internal error:', { uid: request.auth?.uid, error });
      throw new https.HttpsError('internal', 'An internal server error occurred.');
      
    }
  }
)

