import { z } from "zod";
import { UserInfo, UserInfoSchema } from "./user-info.dto";

const CandidateStatusSchema = z.enum([
  'pending',
  'proximity-verification-requested',
  'proximity-verification-failed',
  'proximity-verification-succeeded',
  'help-request-notified',
], {
  errorMap: (issue, ctx) => {
    if (issue.code === 'invalid_enum_value') {
      return { message: `Invalid candidate status: ${ctx.data}` };
    }
    return { message: ctx.defaultError };
  }
});

export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;

export const CandidateSchema = z.object({
  userInfo: UserInfoSchema,
  status: CandidateStatusSchema
});

export type CandidatePersistenceModel = z.infer<typeof CandidateSchema>;


export class Candidate {
  private constructor(
    readonly userInfo: UserInfo,
    private _status: CandidateStatus,
  ) {}

  static create(userInfo: UserInfo, status: CandidateStatus = 'pending'): Candidate {
    CandidateStatusSchema.parse(status); // Validate status
    return new Candidate(userInfo, status);
  }

  get status(): CandidateStatus {
    return this._status;
  }

  static fromPersistenceModel(model: CandidatePersistenceModel): Candidate {
    const userInfoDTO = UserInfoSchema.parse(model.userInfo);
    const userInfo = UserInfo.create(userInfoDTO); // Validate and create UserInfo
    const status = CandidateStatusSchema.parse(model.status); // Validate status
    return Candidate.create(userInfo, status);
  }

  statusIs(status: CandidateStatus): boolean {
    CandidateStatusSchema.parse(status); // Validate status
    return this._status === status;
  }

  toPersistenceModel():  {id: string, nickname: string, iconUrl: string, physicalDescription: string, deviceId: string, status: CandidateStatus} {
    return {
      id: this.userInfo.id.value,
      nickname: this.userInfo.nickname,
      iconUrl: this.userInfo.iconUrl,
      physicalDescription: this.userInfo.physicalDescription,
      deviceId: this.userInfo.deviceId.value,
      status: this._status
    };
  }

  toUserInfo(): UserInfo {
    return this.userInfo;
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

  notified(): void {
    if (this._status !== 'proximity-verification-succeeded') {
      throw new Error('Invalid state transition');
    }
    this._status = 'help-request-notified';
  }
}