import {HelpRequestId} from "../help-request-id.value.js";

export interface IProximityVerificationTimeoutScheduler {
  schedule(helpRequestId: HelpRequestId, timeoutAt: Date): Promise<void>;
}
