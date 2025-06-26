import { IClock } from "../../src/domain/shared/service/i-clock.service";

export class TestClock implements IClock {

  now(): Date {
    return new Date("2023-10-01T00:00:00Z"); // Fixed date for testing
  }
}