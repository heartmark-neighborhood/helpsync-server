import {https, logger} from "firebase-functions";
import {HandleProximityVerificationResultInputSchema, HandleProximityVerificationResultCommand, HandleProximityVerificationResultUseCase} from "../../domain/help-request/handle-proximity-verification-result.usecase";
import {getFirestore} from "firebase-admin/firestore";
import {HelpRequestRepository} from "../firestore/help-request.repository";
import {SystemClock} from "../service/SystemClock";

export const handleProximityVerificationResult = https.onCall(async (request) => {
  if (!request.auth) {
    throw new https.HttpsError("unauthenticated", "Unauthorized request");
  }

  const validationResult = HandleProximityVerificationResultInputSchema.safeParse(request.data);
  if (!validationResult.success) {
    throw new https.HttpsError("invalid-argument", `Invalid request data: ${validationResult.error.message}`);
  }

  console.log("Proximity verification result received:", request.data);
  logger.info("Proximity verification result received", {data: request.data});
  try {
    const db = getFirestore();
    const clock = SystemClock.create();
    const repository = HelpRequestRepository.create(db, clock);

    const command = HandleProximityVerificationResultCommand.create(validationResult.data);
    const usecase = new HandleProximityVerificationResultUseCase(repository);
    await usecase.execute(command);
    console.log("Proximity verification result processed successfully.");

    return {success: true, message: "Proximity verification result processed successfully."};
  } catch (error) {
    console.error("Error processing proximity verification result:", error);
    logger.error("Error processing proximity verification result", {error});
    throw new https.HttpsError("internal", "Error processing request");
  }
});
