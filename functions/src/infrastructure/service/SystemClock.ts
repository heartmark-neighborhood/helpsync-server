import {IClock} from "../../domain/shared/service/i-clock.service";

export class SystemClock implements IClock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static create(): SystemClock {
    return new SystemClock();
  }

  now(): Date {
    return new Date();
  }
}
