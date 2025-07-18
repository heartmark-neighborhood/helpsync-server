import {MemoryHelpRequestRepository} from "../../../__test__/fake/memory-help-request.repository.js";
import {CompleteHelpRequestUsecase} from "./complete-help-request.usecase.js";

describe("ヘルプ完了通知", () => {
  it("ヘルプ完了通知を受け取ると、ヘルプ要請の状態が更新される", async () => {
    const repository = new MemoryHelpRequestRepository();
    const usecase = new CompleteHelpRequestUsecase(repository);
    const helpRequest = await repository.getForCompleteTesting();
    await usecase.execute(helpRequest.id);

    const updatedHelpRequest = await repository.findWithRequesterInfoById(helpRequest.id);

    expect(updatedHelpRequest).not.toBeNull();
    expect(updatedHelpRequest?.helpRequest.status).toBe("completed");
  });
});
