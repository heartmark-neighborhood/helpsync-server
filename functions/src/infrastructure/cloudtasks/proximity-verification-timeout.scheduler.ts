import {IProximityVerificationTimeoutScheduler} from "../../domain/help-request/service/i-proximity-verfication-timeout.scheduler.js";
import {HelpRequestId} from "../../domain/help-request/help-request-id.value.js";

export class ProximityVerificationTimeoutScheduler implements IProximityVerificationTimeoutScheduler {
  private readonly QUEUE = "proximity-verification-timeout-queue";
  private readonly FUNCTION_URL = "https://<function-name>-<random-hash>-<region>.a.run.app"; // TODO: Replace with actual Cloud Function URL
  private readonly PROJECT_ID = "heartmark-neighborhood";
  private readonly SERVICE_ACCOUNT_EMAIL = `${this.PROJECT_ID}@appspot.gserviceaccount.com`;
  private readonly LOCATION = "asia-northeast1";


  constructor() {
    // コンストラクタでは何も初期化しない
  }

  async schedule(helpRequestId: HelpRequestId, timeoutAt: Date): Promise<void> {
    console.log(`Scheduling timeout for Help Request ID: ${helpRequestId} at ${timeoutAt}`);

    // scheduleメソッド内で動的インポート
    const {CloudTasksClient} = await import("@google-cloud/tasks");
    const client = new CloudTasksClient();

    const task = {
      httpRequest: {
        httpMethod: "POST" as const,
        url: this.FUNCTION_URL,
        headers: {"Content-Type": "application/json"},
        oidcToken: {serviceAccountEmail: this.SERVICE_ACCOUNT_EMAIL},
        body: JSON.stringify({helpRequestId: helpRequestId.toString()}),
      },
      scheduleTime: {seconds: timeoutAt.getTime() / 1000},
    };

    try {
      const parent = client.queuePath(this.PROJECT_ID, this.LOCATION, this.QUEUE);
      const [response] = await client.createTask({parent, task});
      console.log(`Task created: ${response.name}`);
    } catch (error) {
      console.error(`Error scheduling task for Help Request ID ${helpRequestId}:`, error);
      throw new Error(`Failed to schedule timeout for Help Request ID ${helpRequestId}`);
    }
  }

  static create(): ProximityVerificationTimeoutScheduler {
    return new ProximityVerificationTimeoutScheduler();
  }
}
