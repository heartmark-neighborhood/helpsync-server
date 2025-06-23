import { UserId } from "../user/user-id.value";
import { z } from "zod";

const CandidateStatusSchema = z.enum([
  'pending',
  'proximity-verification-requested',
  'proximity-verification-failed',
  'proximity-verification-succeeded',
  'notified',
  'accepted',
  'declined'
], {
  errorMap: (issue, ctx) => {
    if (issue.code === 'invalid_enum_value') {
      return { message: `Invalid candidate status: ${ctx.data}` };
    }
    return { message: ctx.defaultError };
  }
});

export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;


export class Candidate {
  private constructor(
    readonly candidateId: UserId,
    private _status: CandidateStatus = 'pending'
  ) {}

  static create(candidateId: UserId, status: CandidateStatus): Candidate {
    CandidateStatusSchema.parse(status); // Validate status
    return new Candidate(candidateId, status);
  }

  statusIs(status: CandidateStatus): boolean {
    CandidateStatusSchema.parse(status); // Validate status
    return this._status === status;
  }

  toPersistenceModel(): { candidateId: string, status: CandidateStatus } {
    return {
      candidateId: this.candidateId.value,
      status: this._status,
    };
  }

  requestProximityVerification(): void {
    if (this._status !== 'pending') {
      throw new Error('Invalid state transition');
    }
    this._status = 'proximity-verification-requested';
  }
  failProximityVerification(): void {
    if (this._status !== 'proximity-verification-requested') {
      throw new Error('Invalid state transition');
    }
    this._status = 'proximity-verification-failed';
  }

  successProximityVerification(): void {
    if (this._status !== 'proximity-verification-requested') {
      throw new Error('Invalid state transition');
    }
    this._status = 'proximity-verification-succeeded';
  }

  notify(): void {
    if (this._status !== 'proximity-verification-succeeded') {
      throw new Error('Invalid state transition');
    }
    this._status = 'notified';
  }

  accept(): void {
    if (this._status !== 'notified') {
      throw new Error('Invalid state transition');
    }
    this._status = 'accepted';
  }

  decline(): void {
    if (this._status !== 'notified') {
      throw new Error('Invalid state transition');
    }
    this._status = 'declined';
  }
}