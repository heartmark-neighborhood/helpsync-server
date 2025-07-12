import {UserId} from "../user/user-id.value";
import {Candidate, CandidateSchema, CandidateStatus} from "./candidate.entity";

import {z} from "zod";
import {UserInfo} from "./user-info.dto";

export const CandidatesCollectionSchema = z.array(CandidateSchema);
export type CandidatesCollectionProps = z.infer<typeof CandidatesCollectionSchema>;

export class CandidatesCollection {
  private readonly candidates: Candidate[] = [];

  private constructor(candidates: Candidate[] = []) {
    this.candidates = candidates;
  }

  static create(candidates: Candidate[] = []): CandidatesCollection {
    return new CandidatesCollection(candidates);
  }

  withStatus(status: CandidateStatus): CandidatesCollection {
    const filteredCandidates = this.candidates.filter((candidate) => candidate.statusIs(status));
    return CandidatesCollection.create(filteredCandidates);
  }

  add(candidate: Candidate): CandidatesCollection {
    if (this.exists(candidate.userInfo.id)) {
      throw new Error(`Candidate with ID ${candidate.userInfo.id.value} already exists.`);
    }
    return CandidatesCollection.create([...this.candidates, candidate]);
  }

  addAll(candidates: CandidatesCollection): CandidatesCollection {
    const newCandidates = candidates.all.filter(
      (candidate) => !this.exists(candidate.userInfo.id)
    );
    return CandidatesCollection.create([...this.candidates, ...newCandidates]);
  }

  exists(candidateId: UserId): boolean {
    return this.candidates.some((c) => c.userInfo.id.equals(candidateId));
  }

  getRandomCandidateByStatus(status: CandidateStatus): Candidate | null {
    const filtered = this.candidates.filter((candidate) => candidate.statusIs(status));
    if (filtered.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  handleProximityVerificationResult(
    userId: UserId,
    verificationResult: boolean
  ): CandidatesCollection {
    const updatedCandidates = this.candidates.map((candidate) => {
      if (candidate.userInfo.id.equals(userId)) {
        if (verificationResult) {
          candidate.succeedProximityVerification();
        } else {
          candidate.failedProximityVerification();
        }
      }
      return candidate;
    });
    return CandidatesCollection.create(updatedCandidates);
  }

  timeoutProximityVerification(): CandidatesCollection {
    const updatedCandidates = this.candidates.map((candidate) => {
      if (candidate.statusIs("proximity-verification-requested")) {
        candidate.failedProximityVerification();
      }
      return candidate;
    });
    return CandidatesCollection.create(updatedCandidates);
  }

  notifiedHelpRequest(): CandidatesCollection {
    const updatedCandidates = this.candidates.map((candidate) => {
      if (candidate.statusIs("proximity-verification-succeeded")) {
        candidate.notified();
      }
      return candidate;
    });
    return CandidatesCollection.create(updatedCandidates);
  }

  existsByStatus(status: CandidateStatus): boolean {
    return this.candidates.some((candidate) => candidate.statusIs(status));
  }

  toPersistenceModel(): { id: string, nickname: string, iconUrl: string, physicalDescription: string, deviceId: string, status: CandidateStatus }[] {
    return this.candidates.map((candidate) => candidate.toPersistenceModel());
  }

  toUserInfos(): UserInfo[] {
    return this.candidates.map((candidate) => candidate.toUserInfo());
  }

  public get all(): readonly Candidate[] {
    return this.candidates;
  }
}
