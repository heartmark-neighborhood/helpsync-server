import { IProximityVerificationTimeoutScheduler } from '../../domain/help-request/service/i-proximity-verfication-timeout.scheduler';
import { HelpRequestId } from '../../domain/help-request/help-request-id.value';

export class ProximityVerificationTimeoutScheduler implements IProximityVerificationTimeoutScheduler {
  async schedule(helpRequestId: HelpRequestId, timeoutAt: Date): Promise<void> {
    // Implementation for scheduling a proximity verification timeout
    console.log(`Scheduling timeout for Help Request ID: ${helpRequestId} at ${timeoutAt}`);
    // Here you would typically interact with a task queue or scheduler service
  }

  async cancel(helpRequestId: HelpRequestId): Promise<void> {
    // Implementation for canceling a scheduled proximity verification timeout
    console.log(`Canceling timeout for Help Request ID: ${helpRequestId}`);
    // Here you would typically remove the task from the queue or scheduler service
  }

  static create(): ProximityVerificationTimeoutScheduler {
    return new ProximityVerificationTimeoutScheduler();
  }
}