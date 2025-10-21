import {DeleteDeviceInputSchema, DeleteDeviceCommand, DeleteDeviceUseCase} from "../../domain/device/delete-device.usecase";
import {getFirestore} from "firebase-admin/firestore";
import {https, logger} from "firebase-functions";
import {DeviceRepository} from "../firestore/device.repository.js";
import {SystemClock} from "../service/SystemClock.js";
import {DeviceId} from "../../domain/device/device-id.value";
import {UserId} from "../../domain/user/user-id.value";

export const deleteDevice = https.onCall(async (request) => {
  try {
    logger.info("Received deleteDevice request:", {data: request.data, auth: request.auth});
    if (!request.auth) {
      throw new https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    const input = DeleteDeviceInputSchema.parse(request.data);
    const firestore = getFirestore();
    const deviceRepository = DeviceRepository.create(
      firestore,
      SystemClock.create()
    );
    const deleteDeviceUseCase = DeleteDeviceUseCase.create(deviceRepository);
    const command = DeleteDeviceCommand.create(
      DeviceId.create(input.deviceId),
      UserId.create(request.auth.uid),
    );
    await deleteDeviceUseCase.execute(command);

    return {success: true};
  } catch (error) {
    logger.error("Error deleting device:", error);
    throw new https.HttpsError(
      "internal",
      (error as Error).message,
    );
  }
});
