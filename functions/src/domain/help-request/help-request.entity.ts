import { Location } from "../shared/value-object/Location.value";
import { UserId } from "../user/user-id.value";
import { HelpRequestId } from "./help-request-id.value";
import { ProximityVerificationId } from "./proximity-verification-id.value";

type HelpRequestStatus = 'SEARCHING' | 'WAITING_RESPONSE' | 'MATCHED' | 'COMPLETED' | 'FAILED' | 'CANCELED';


export class HelpRequest{
  private constructor(
    readonly id: HelpRequestId,
    readonly proximityVerificationId: ProximityVerificationId,
    readonly requesterId: UserId,
    readonly status: HelpRequestStatus,
    readonly matchedSupportersIds: UserId[] = [],
    readonly location: Location,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ){}

  static create(
    helpRequestId: HelpRequestId,
    proximityVerificationId: ProximityVerificationId,
    requesterId: UserId,
    status: HelpRequestStatus,
    location: Location,
    createdAt: Date,
    updatedAt: Date 
  ): HelpRequest {
    return new HelpRequest(helpRequestId, proximityVerificationId, requesterId, status, [], location, createdAt, updatedAt);
  }

  complete(): HelpRequest {
    return new HelpRequest(
      this.id,
      this.proximityVerificationId,
      this.requesterId,
      'COMPLETED',
      this.matchedSupportersIds,
      this.location,
      this.createdAt,
      new Date()
    );
  }
}