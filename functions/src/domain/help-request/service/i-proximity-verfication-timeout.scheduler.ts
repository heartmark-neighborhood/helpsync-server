import {HelpRequestId} from "../help-request-id.value";

export interface IProximityVerificationTimeoutScheduler {
  schedule(helpRequestId: HelpRequestId, timeoutAt: Date): Promise<void>;
}
