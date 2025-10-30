import {https, logger} from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";

import {UpdateDeviceLocationCommand, UpdateDeviceLocationInputSchema, UpdateDeviceLocationUseCase} from "../../domain/device/update-device-location.usecase";
import {DeviceRepository} from "../firestore/device.repository";
import {SystemClock} from "../service/SystemClock";


export const updateDeviceLocation = https.onCall(async (request) => {
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "Unauthenticated request");
  }

  const firestore = getFirestore("helpsync-db");
  const clock = SystemClock.create();
  const repository = DeviceRepository.create(firestore, clock);

  const usecase = UpdateDeviceLocationUseCase.create(repository);

  const parsedData = UpdateDeviceLocationInputSchema.safeParse(request.data);
  if (!parsedData.success) {
    logger.error("Invalid input data", parsedData.error);
    throw new https.HttpsError("invalid-argument", "Invalid input data");
  }
  const command = UpdateDeviceLocationCommand.create(parsedData.data);

  logger.info("Executing UpdateDeviceLocationCommand", {command});
  await usecase.execute(command);
  return {success: true};
});
