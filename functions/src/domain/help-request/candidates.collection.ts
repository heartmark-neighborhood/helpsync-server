import { UserId } from "../user/user-id.value";
import { Candidate, CandidateSchema } from "./candidate.entity";
import { CandidateStatus } from "./candidate.entity";

import { z } from "zod";

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

  add(candidate: Candidate): CandidatesCollection {
    if (this.exists(candidate.candidateId)) {
      throw new Error(`Candidate with ID ${candidate.candidateId.value} already exists.`);
    }
    return CandidatesCollection.create([...this.candidates, candidate]);
  }

  addAll(candidates: CandidatesCollection): CandidatesCollection {
    const newCandidates = candidates.all.filter(
      (candidate) => !this.exists(candidate.candidateId)
    );
    return CandidatesCollection.create([...this.candidates, ...newCandidates]);
  }

  exists(candidateId: UserId): boolean {
    return this.candidates.some((c) => c.candidateId.equals(candidateId));
  }

  getRandomCandidateByStatus(status: CandidateStatus): Candidate | null {
    const filtered = this.candidates.filter((candidate) => candidate.statusIs(status));
    if (filtered.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }

  timeoutProximityVerification(): CandidatesCollection {
    const updatedCandidates = this.candidates.map((candidate) => {
      if (candidate.statusIs('proximity-verification-requested')) {
        candidate.failProximityVerification();
      }
      return candidate;
    });
    return CandidatesCollection.create(updatedCandidates);
  }

  existsByStatus(status: CandidateStatus): boolean {
    return this.candidates.some((candidate) => candidate.statusIs(status));
  }

  toPersistenceModel(): CandidatesCollectionProps {
    return this.candidates.map((candidate) => candidate.toPersistenceModel());

  }

  public get all(): readonly Candidate[] {
    return this.candidates;
  }
}