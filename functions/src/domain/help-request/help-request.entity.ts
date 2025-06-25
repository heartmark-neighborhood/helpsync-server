import { Location } from "../shared/value-object/Location.value";
import { UserId } from "../user/user-id.value";
import { Candidate } from "./candidate.entity";
import { CandidatesCollection } from "./candidates.collection";
import { HelpRequestId } from "./help-request-id.value";
import { ProximityVerificationId } from "./proximity-verification-id.value";
import { IClock } from "../shared/service/i-clock.service";

import { z } from "zod";

export const HelpRequestStatusSchema = z.enum([
  'pending',
  'searching',
  'waiting_response',
  'matched',
  'completed',
  'failed',
  'canceled'
], {
  errorMap: (issue, ctx) => {
    if (issue.code === 'invalid_enum_value') {
      return { message: `Invalid help request status: ${ctx.data}` };
    }
    return { message: ctx.defaultError };
  }
});

export type HelpRequestStatus = z.infer<typeof HelpRequestStatusSchema>;


export class HelpRequest{
  private constructor(
    readonly id: HelpRequestId,
    readonly proximityVerificationId: ProximityVerificationId,
    readonly requesterId: UserId,
    readonly status: HelpRequestStatus,
    readonly location: Location,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly candidatesCollection: CandidatesCollection,
    private readonly clock: IClock
  ){}

  static create(
    helpRequestId: HelpRequestId,
    proximityVerificationId: ProximityVerificationId,
    requesterId: UserId,
    status: HelpRequestStatus,
    location: Location,
    createdAt: Date,
    updatedAt: Date,
    candidates: CandidatesCollection = CandidatesCollection.create(),
    clock: IClock
  ): HelpRequest {
    return new HelpRequest(
      helpRequestId, 
      proximityVerificationId, 
      requesterId, 
      status, 
      location, 
      createdAt, 
      updatedAt, 
      candidates,
      clock
    );
  }

  addCandidate(candidateId: UserId): HelpRequest {
    const candidate = Candidate.create(candidateId, 'pending');
    const updatedCandidates = this.candidatesCollection.add(candidate);
    return new HelpRequest(
      this.id,
      this.proximityVerificationId,
      this.requesterId,
      this.status,
      this.location,
      this.createdAt,
      this.clock.now(),
      updatedCandidates,
      this.clock
    );
  }

  toPersistenceModel() {
    return {
      id: this.id.value,
      proximityVerificationId: this.proximityVerificationId.value,
      requesterId: this.requesterId.value,
      status: this.status,
      location: this.location,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      candidates: this.candidatesCollection.toPersistenceModel()
    };
  }
}