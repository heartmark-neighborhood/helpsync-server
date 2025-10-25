import {https, logger} from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";

import {z} from "zod";

import {CreateHelpRequestInputSchema, CreateHelpRequestCommand, CreateHelpRequestUseCase} from "../../domain/help-request/create-help-request.usecase.js";
import {HelpRequestRepository} from "../firestore/help-request.repository.js";
import {UserRepository} from "../firestore/User.repository.js";
import {FcmGateway} from "../notifications/fcm-gateway.js";
import {ProximityVerificationNotifier} from "../notifications/proximity-verification.notifier.js";
import {UserId} from "../../domain/user/user-id.value.js";
import {Location} from "../../domain/shared/value-object/Location.value.js";
import {SystemClock} from "../service/SystemClock.js";
import {ProximityVerificationTimeoutScheduler} from "../cloudtasks/proximity-verification-timeout.scheduler.js";
import {DeviceRepository} from "../firestore/device.repository.js";
import {DeviceId} from "../../domain/device/device-id.value.js";


export const createHelpRequest = https.onCall(
  async (request) => {
    logger.info("Received create help request call", {uid: request.auth?.uid, data: request.data});
    if (!request.auth) {
      logger.error("Unauthorized request");
      throw new https.HttpsError("unauthenticated", "Unauthorized request");
    }

    try {
      const db = getFirestore();
      const clock = SystemClock.create();
      const helpRequestRepository = HelpRequestRepository.create(db, clock);
      const userRepository = UserRepository.create(db, clock);
      const deviceRepository = DeviceRepository.create(db, clock);
      const notifier = ProximityVerificationNotifier.create(FcmGateway.create());
      const scheduler = ProximityVerificationTimeoutScheduler.create();

      const usecase = CreateHelpRequestUseCase.create(
        helpRequestRepository,
        userRepository,
        deviceRepository,
        notifier,
        scheduler,
      );

      const input = CreateHelpRequestInputSchema.parse(request.data);
      const requesterId = UserId.create(request.auth.uid);
      const location = Location.create(input.location);
      const deviceId = DeviceId.create(input.deviceId);

      const command = CreateHelpRequestCommand.create(
        requesterId,
        location,
        deviceId,
        clock
      );

      const helpRequest = await usecase.execute(command);
      logger.info("Help request created successfully", {uid: request.auth.uid, helpRequestId: helpRequest.id});
      return {helpRequestId: helpRequest.id};
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Validation error:", {uid: request.auth?.uid, errors: error.errors});
        throw new https.HttpsError("invalid-argument", "The data provided is invalid.");
      }

      logger.error("Internal error:", {uid: request.auth?.uid, error, errorMessage: error instanceof Error ? error.message : "Unknown error"});
      throw new https.HttpsError("internal", "An internal server error occurred.", {
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

