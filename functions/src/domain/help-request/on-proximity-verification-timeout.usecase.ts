import {z} from "zod";

import {HelpRequestId, HelpRequestIdSchema} from "./help-request-id.value";
import {IHelpRequestRepository} from "./i-help-request.repository";
import {IHelpRequestNotifier} from "./service/i-help-request.notifier";

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
    const {helpRequestId} = command;

    const helpRequestWithRequesterInfo = await this.helpRequestRepository.findWithRequesterInfoById(helpRequestId);
    if (!helpRequestWithRequesterInfo) {
      throw new Error(`Help request with ID ${helpRequestId.value} not found`);
    }
    const {helpRequest, requester} = helpRequestWithRequesterInfo;

    const timeoutedHelpRequest = helpRequest.timeoutProximityVerification();
    const candidatesToNotify = timeoutedHelpRequest.candidatesCollection.withStatus("proximity-verification-succeeded");
    for (const candidate of candidatesToNotify.all) {
      await this.helpRequestNotifier.notifyRequesterOfMatches(candidate.userInfo.deviceId, requester);
    }
    await this.helpRequestNotifier.notifySupporterOfMatches(
      requester.deviceId,
      candidatesToNotify.toUserInfos()
    );
    const sentHelpRequest = timeoutedHelpRequest.sentHelpRequest();
    await this.helpRequestRepository.save(sentHelpRequest);
  }

  private constructor(
    private readonly helpRequestRepository: IHelpRequestRepository,
    private readonly helpRequestNotifier: IHelpRequestNotifier
  ) {}

  static create(
    helpRequestRepository: IHelpRequestRepository,
    helpRequestNotifier: IHelpRequestNotifier,
  ): ProximityVerificationTimeoutUseCase {
    return new ProximityVerificationTimeoutUseCase(helpRequestRepository, helpRequestNotifier);
  }
}
