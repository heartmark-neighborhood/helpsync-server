import {z} from "zod";
import { HelpRequestId, HelpRequestIdSchema } from "./help-request-id.value";
import { HelpRequestRepository } from "../../infrastructure/firestore/help-request.repository";
import { IHelpRequestRepository } from "./i-help-request.repository";
import { UserRepository } from "../../infrastructure/firestore/User.repository";

export const CompleteHelpInputSchema = z.object({
    helpRequestId : HelpRequestIdSchema,
}).strict()

export type CompleteHelpInput = z.infer<typeof CompleteHelpInputSchema>;

export class CompleteHelpRequest{
     private helprequestid : string
     private helprequestrepository : IHelpRequestRepository

     constructor(repository: IHelpRequestRepository){
        this.helprequestrepository = repository;
     }

     async execute(helpRequestId: HelpRequestId){
        const helpRequest = await this.helprequestrepository.findById(helpRequestId)
        if(!helpRequest){
            throw new Error("Such a help request does not exist.")
        }
        const completedHelpRequest = helpRequest.complete()
        this.helprequestrepository.save(completedHelpRequest)
     }
}