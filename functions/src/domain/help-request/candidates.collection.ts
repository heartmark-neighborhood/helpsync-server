import { UserId } from "../user/user-id.value";
import { Candidate } from "./candidate.entity";
import { CandidateStatus } from "./candidate.entity";


export class CandidatesCollection {
  private readonly candidates: Candidate[] = [];

  private constructor(candidates: Candidate[] = []) {
    this.candidates = candidates;
  }

  static create(candidates: Candidate[] = []): CandidatesCollection {
    return new CandidatesCollection(candidates);
  }

  add(candidates: CandidatesCollection): CandidatesCollection {
    const newCandidates = candidates.all.filter(
      (candidate) => !this.exists(candidate.candidateId)
    );
    return new CandidatesCollection([...this.candidates, ...newCandidates]);
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

  toPersistenceModel() {
    return this.candidates.map((candidate) => candidate.toPersistenceModel());

  }

  public get all(): readonly Candidate[] {
    return this.candidates;
  }
}