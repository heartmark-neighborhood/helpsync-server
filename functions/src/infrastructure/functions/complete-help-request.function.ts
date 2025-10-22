import {https, logger} from "firebase-functions";
import {getFirestore} from "firebase-admin/firestore";
import {CompleteHelpInputSchema, CompleteHelpRequestUsecase} from "../../domain/help-request/complete-help-request.usecase.js";
import {HelpRequestId} from "../../domain/help-request/help-request-id.value.js";
import {HelpRequestRepository} from "../firestore/help-request.repository.js";
import {SystemClock} from "../service/SystemClock.js";


export const completeHelpRequest = https.onCall(
  async (request) => {
    logger.info("Received create help request call", {uid: request.auth?.uid, data: request.data});
    if (!request.auth) {
      logger.error("Unauthorized request");
      throw new https.HttpsError("unauthenticated", "Unauthorized request");
    }

    const input = CompleteHelpInputSchema.parse(request.data);
    const helpid: HelpRequestId = HelpRequestId.create(input.helpRequestId);
    const db = getFirestore();
    const clock = SystemClock.create();
    const repository = HelpRequestRepository.create(db, clock);

    logger.info("Executing complete help request usecase", {helpid: helpid.value});
    const usecase = new CompleteHelpRequestUsecase(repository);
    await usecase.execute(helpid);
  }
);
