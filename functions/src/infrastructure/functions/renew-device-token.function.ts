import {https, logger} from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";

import {RenewDeviceTokenCommand, RenewDeviceTokenSchema, RenewDeviceTokenUseCase} from "../../domain/device/renew-device-token.usecase";
import {DeviceRepository} from "../firestore/device.repository";
import {SystemClock} from "../service/SystemClock";

export const renewDeviceToken = https.onCall(async (request) => {
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "Unauthenticated request");
  }

  const firestore = getFirestore();
  const clock = SystemClock.create();
  const repository = DeviceRepository.create(firestore, clock);

  const usecase = RenewDeviceTokenUseCase.create(repository);

  const parsedData = RenewDeviceTokenSchema.safeParse(request.data);
  if (!parsedData.success) {
    logger.error("Invalid input data", parsedData.error);
    throw new https.HttpsError("invalid-argument", "Invalid input data");
  }
  const command = RenewDeviceTokenCommand.create(parsedData.data);

  logger.info("Executing UpdateDeviceLocationCommand", {command});
  await usecase.execute(command);
  return {success: true};
});
