import {getFirestore} from "firebase-admin/firestore";
import {https, logger} from "firebase-functions";

import {z} from "zod";
import {RegisterNewDeviceSchema, RegisterNewDeviceCommand, RegisterNewDeviceUseCase} from "../../domain/device/register-new-device.usecase.js";
import {DeviceRepository} from "../firestore/device.repository.js";
import {UserId} from "../../domain/user/user-id.value.js";
import {SystemClock} from "../service/SystemClock.js";
import {DeviceToken} from "../../domain/device/device-token.value.js";
import {Location} from "../../domain/shared/value-object/Location.value.js";

export const registerNewDevice = https.onCall(
  async (request) => {
    logger.info("Received register new device call", {uid: request.auth?.uid, data: request.data});
    if (!request.auth) {
      logger.error("Unauthorized request");
      throw new https.HttpsError("unauthenticated", "Unauthorized request");
    }
    try {
      const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
      logger.info("Cloud Function Project ID:", {projectId: projectId});
      const db = getFirestore("helpsync-db");
      const clock = SystemClock.create();

      const deviceRepository = DeviceRepository.create(db, clock);
      const usecase = RegisterNewDeviceUseCase.create(deviceRepository);

      const input = RegisterNewDeviceSchema.parse(request.data);
      const userId = UserId.create(request.auth.uid);
      const deviceToken = DeviceToken.create(input.deviceToken);
      const location = Location.create(input.location);

      const command = RegisterNewDeviceCommand.create(
        userId,
        deviceToken,
        location,
        clock
      );

      logger.info("Executing RegisterNewDeviceUseCase", {uid: request.auth.uid, command: {userId: userId, deviceToken: deviceToken, location: location}});
      const registeredDevice = await usecase.execute(command);
      logger.info("Device registered successfully", {uid: request.auth.uid, deviceId: registeredDevice.id.value});
      return {
        deviceId: registeredDevice.id.toString(),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Invalid input data", {uid: request.auth?.uid, errors: error.errors});
        throw new https.HttpsError("invalid-argument", "Invalid input data", error.errors);
      }
      logger.error("Error registering new device", {uid: request.auth?.uid, errorMessage: error});
      throw new https.HttpsError("internal", "Error registering new device");
    }
  }
);
