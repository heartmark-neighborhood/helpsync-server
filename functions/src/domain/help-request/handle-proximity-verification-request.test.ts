import {MemoryHelpRequestRepository} from "../../../__test__/fake/memory-help-request.repository";
import {HandleProximityVerificationResultCommand, HandleProximityVerificationResultUseCase} from "./handle-proximity-verification-result.usecase";

describe("近接確認結果通知の処理", () => {
  it("成功した場合は候補者の状態を更新する", async () => {
    const repository = new MemoryHelpRequestRepository();
    const usecase = new HandleProximityVerificationResultUseCase(repository);
    const helpRequest = repository.getForHandleProximityVerificationResultTest();
    const candidate = helpRequest.candidatesCollection.getRandomCandidateByStatus("proximity-verification-requested");
    if (!candidate) {
      throw new Error("No candidate found for proximity verification request");
    }
    const command = HandleProximityVerificationResultCommand.create({
      helpRequestId: helpRequest.id.value,
      userId: candidate.userInfo.id.value,
      verificationResult: true,
    });
    await usecase.execute(command);

    const result = await repository.findWithRequesterInfoById(helpRequest.id);
    if (!result) {
      throw new Error("Help request not found after update");
    }
    const updatedHelpRequest = result.helpRequest;
    const updatedCandidate = updatedHelpRequest.candidatesCollection.getRandomCandidateByStatus("proximity-verification-succeeded");
    if (!updatedCandidate) {
      throw new Error("No candidate found with status proximity-verification-succeeded");
    }

    expect(updatedHelpRequest.status).toBe("proximity-verification-requested");
    expect(updatedCandidate).toBeDefined();
    expect(updatedCandidate.status).toBe("proximity-verification-succeeded");
  });

  it("失敗した場合は候補者の状態を更新する", async () => {
    const repository = new MemoryHelpRequestRepository();
    const usecase = new HandleProximityVerificationResultUseCase(repository);
    const helpRequest = repository.getForHandleProximityVerificationResultTest();
    const candidate = helpRequest.candidatesCollection.getRandomCandidateByStatus("proximity-verification-requested");
    if (!candidate) {
      throw new Error("No candidate found for proximity verification request");
    }
    const command = HandleProximityVerificationResultCommand.create({
      helpRequestId: helpRequest.id.value,
      userId: candidate.userInfo.id.value,
      verificationResult: false,
    });
    await usecase.execute(command);

    const result = await repository.findWithRequesterInfoById(helpRequest.id);
    if (!result) {
      throw new Error("Help request not found after update");
    }
    const updatedHelpRequest = result.helpRequest;
    const updatedCandidate = updatedHelpRequest.candidatesCollection.getRandomCandidateByStatus("proximity-verification-failed");
    if (!updatedCandidate) {
      throw new Error("No candidate found with status proximity-verification-failed");
    }

    expect(updatedHelpRequest.status).toBe("proximity-verification-requested");
    expect(updatedCandidate).toBeDefined();
    expect(updatedCandidate.status).toBe("proximity-verification-failed");
  });
});
