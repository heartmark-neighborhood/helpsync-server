import {z} from "zod";

import {HelpRequestId, HelpRequestIdSchema} from "./help-request-id.value.js";
import {IHelpRequestRepository} from "./i-help-request.repository.js";
import {IHelpRequestNotifier} from "./service/i-help-request.notifier.js";
import {logger} from "firebase-functions";
import {IDeviceRepository} from "../device/i-device.repository.js";

export const ProximityVerificationTimeoutInputSchema = z.object({
  helpRequestId: HelpRequestIdSchema,
}).strict();

export type ProximityVerificationTimeoutInput = z.infer<typeof ProximityVerificationTimeoutInputSchema>;

export class ProximityVerificationTimeoutCommand {
  private constructor(
    public readonly helpRequestId: HelpRequestId,
  ) {}

  static create(input: ProximityVerificationTimeoutInput): ProximityVerificationTimeoutCommand {
    const helpRequestId = HelpRequestId.create(input.helpRequestId);
    return new ProximityVerificationTimeoutCommand(helpRequestId);
  }
}

export class ProximityVerificationTimeoutUseCase {
  public async execute(command: ProximityVerificationTimeoutCommand): Promise<void> {
    logger.info("ProximityVerificationTimeoutUseCase.execute called with command:", {helpRequestId: command.helpRequestId.value});
    const {helpRequestId} = command;

    const helpRequestWithRequesterInfo = await this.helpRequestRepository.findWithRequesterInfoById(helpRequestId);
    if (!helpRequestWithRequesterInfo) {
      logger.warn(`Help request with ID ${helpRequestId.value} not found.`);
      throw new Error(`Help request with ID ${helpRequestId.value} not found`);
    }
    const {helpRequest, requester} = helpRequestWithRequesterInfo;
    logger.info("Help request and requester found.", {helpRequestId: helpRequest.id.value, requesterId: requester.id.value});

    const timeoutedHelpRequest = helpRequest.timeoutProximityVerification();
    logger.info("Help request proximity verification timeouted.");

    const candidatesToNotify = timeoutedHelpRequest.candidatesCollection.withStatus("proximity-verification-succeeded");
    logger.info("Candidates to notify with 'proximity-verification-succeeded' status:", {count: candidatesToNotify.length});

    for (const candidate of candidatesToNotify.all) {
      const device = await this.deviceRepository.findById(candidate.userInfo.deviceId);
      if (!device) {
        logger.warn(`Device with ID ${candidate.userInfo.deviceId.value} not found for candidate ${candidate.userInfo.id.value}. Skipping notification.`);
        continue;
      }
      logger.info("Device found for candidate.", {candidateId: candidate.userInfo.id.value, deviceId: device.id.value});
      await this.helpRequestNotifier.notifyRequesterOfMatches(device.deviceToken, requester);
      logger.info("Notified requester of matches for candidate:", {candidateId: candidate.userInfo.id.value});
    }

    const requesterDevice = await this.deviceRepository.findById(requester.deviceId);
    if (!requesterDevice) {
      logger.warn(`Device with ID ${requester.deviceId.value} not found for requester ${requester.id.value}. Skipping supporter notification.`);
      return;
    }
    logger.info("Requester device found.", {requesterId: requester.id.value, deviceId: requesterDevice.id.value});
    await this.helpRequestNotifier.notifySupporterOfMatches(
      requesterDevice.deviceToken,
      candidatesToNotify.toUserInfos()
    );
    logger.info("Notified supporter of matches.");

    const sentHelpRequest = timeoutedHelpRequest.sentHelpRequest();
    await this.helpRequestRepository.save(sentHelpRequest);
    logger.info("Help request saved after sending.");
  }

  private constructor(
    private readonly helpRequestRepository: IHelpRequestRepository,
    private readonly deviceRepository: IDeviceRepository,
    private readonly helpRequestNotifier: IHelpRequestNotifier
  ) {}

  static create(
    helpRequestRepository: IHelpRequestRepository,
    deviceRepository: IDeviceRepository,
    helpRequestNotifier: IHelpRequestNotifier,
  ): ProximityVerificationTimeoutUseCase {
    return new ProximityVerificationTimeoutUseCase(helpRequestRepository, deviceRepository, helpRequestNotifier);
  }
}
