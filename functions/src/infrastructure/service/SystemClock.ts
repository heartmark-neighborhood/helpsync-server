import { IClock } from "../../domain/shared/service/i-clock.value";

export class SystemClock implements IClock {
  private constructor() {}

  static create(): SystemClock {
    return new SystemClock();
  }

  now(): Date {
    return new Date();
  }
}