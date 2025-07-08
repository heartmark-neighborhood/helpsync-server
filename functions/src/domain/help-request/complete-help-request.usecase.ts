import { z } from "zod";
import { HelpRequestId, HelpRequestIdSchema } from "./help-request-id.value";
import { IHelpRequestRepository } from "./i-help-request.repository";
export const CompleteHelpInputSchema = z.object({
    helpRequestId : HelpRequestIdSchema,
}).strict()

export type CompleteHelpInput = z.infer<typeof CompleteHelpInputSchema>;

export class CompleteHelpRequestUsecase{
     private helpRequestRepository : IHelpRequestRepository

     constructor(repository: IHelpRequestRepository){
        this.helpRequestRepository = repository;
     }

     async execute(helpRequestId: HelpRequestId){
        const helpRequestWithRequesterInfo = await this.helpRequestRepository.findWithRequesterInfoById(helpRequestId)
        if(!helpRequestWithRequesterInfo){
            throw new Error("Such a help request does not exist.")
        }
        const { helpRequest } = helpRequestWithRequesterInfo;
        const completedHelpRequest = helpRequest.complete()
        await this.helpRequestRepository.save(completedHelpRequest)
     }
}