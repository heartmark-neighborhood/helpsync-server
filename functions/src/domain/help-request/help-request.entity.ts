import { Location } from "../shared/value-object/Location.value";
import { UserId } from "../user/user-id.value";
import { CandidatesCollection } from "./candidates.collection";
import { HelpRequestId } from "./help-request-id.value";
import { ProximityVerificationId } from "./proximity-verification-id.value";
import { IClock } from "../shared/service/i-clock.service";

import { z } from "zod";
import { addMinutes } from "date-fns";

export const HelpRequestStatusSchema = z.enum([
  'pending',
  'proximity-verification-requested',
  'matched',
  'sent',
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
    readonly proximityCheckDeadline: Date,
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
    proximityCheckDeadline: Date,
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
      proximityCheckDeadline,
      clock
    );
  }

  addCandidates(candidates: CandidatesCollection): HelpRequest {
    const updatedCandidates = this.candidatesCollection.addAll(candidates);
    return new HelpRequest(
      this.id,
      this.proximityVerificationId,
      this.requesterId,
      this.status,
      this.location,
      this.createdAt,
      this.clock.now(),
      updatedCandidates,
      this.proximityCheckDeadline,
      this.clock
    );
  }

  requestedProximityVerification(): HelpRequest {
    if (this.status !== 'pending') {
      throw new Error('Invalid state transition');
    }

    const updatedCandidates = this.candidatesCollection.all.map(candidate => {
      if (candidate.statusIs('pending')) {
        candidate.requestProximityVerification();
      }
      return candidate;
    });

    const newProximityCheckDeadline = addMinutes(this.clock.now(), 1);

    const newCandidatesCollection = CandidatesCollection.create(updatedCandidates);
    return new HelpRequest(
      this.id,
      this.proximityVerificationId,
      this.requesterId,
      'proximity-verification-requested',
      this.location,
      this.createdAt,
      this.clock.now(),
      newCandidatesCollection,
      newProximityCheckDeadline,
      this.clock
    );
  }

  handleProximityVerificationResult(userId: UserId, verificationResult: boolean): HelpRequest {
    if (this.status !== 'proximity-verification-requested') {
      throw new Error('Invalid state transition');
    }

    const updatedCandidates = this.candidatesCollection.handleProximityVerificationResult(userId, verificationResult);
    if (updatedCandidates.existsByStatus('proximity-verification-succeeded')) {
      return new HelpRequest(
        this.id,
        this.proximityVerificationId,
        this.requesterId,
        'proximity-verification-requested',
        this.location,
        this.createdAt,
        this.clock.now(),
        updatedCandidates,
        this.proximityCheckDeadline,
        this.clock
      );
    }
    return new HelpRequest(
      this.id,
      this.proximityVerificationId,
      this.requesterId,
      'failed',
      this.location,
      this.createdAt,
      this.clock.now(),
      updatedCandidates,
      this.proximityCheckDeadline,
      this.clock
    );
  }

  timeoutProximityVerification(): HelpRequest {
    if (this.status !== 'proximity-verification-requested') {
      throw new Error('Invalid state transition');
    }

    const updatedCandidates = this.candidatesCollection.timeoutProximityVerification();
    if(updatedCandidates.existsByStatus('proximity-verification-succeeded')) {
      return new HelpRequest(
        this.id,
        this.proximityVerificationId,
        this.requesterId,
        'matched',
        this.location,
        this.createdAt,
        this.clock.now(),
        updatedCandidates,
        this.proximityCheckDeadline,
        this.clock
      );
    }
    return new HelpRequest(
      this.id,
      this.proximityVerificationId,
      this.requesterId,
      'failed',
      this.location,
      this.createdAt,
      this.clock.now(),
      updatedCandidates,
      this.proximityCheckDeadline,
      this.clock
    );
  }

  sentHelpRequest(): HelpRequest {
    if (this.status !== "matched") {
      throw new Error("Invalid state transition");
    }

    const notifiedCandidates = this.candidatesCollection.notifiedHelpRequest();

    return new HelpRequest(
      this.id,
      this.proximityVerificationId,
      this.requesterId,
      "sent",
      this.location,
      this.createdAt,
      this.clock.now(),
      notifiedCandidates,
      this.proximityCheckDeadline,
      this.clock
    );
  }

  toPersistenceModel() {
    return {
      id: this.id.value,
      proximityVerificationId: this.proximityVerificationId.value,
      requesterId: this.requesterId.value,
      status: this.status,
      location: this.location.toPersistenceModel(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      candidates: this.candidatesCollection.toPersistenceModel(),
      proximityCheckDeadline: this.proximityCheckDeadline
    };
  }
}