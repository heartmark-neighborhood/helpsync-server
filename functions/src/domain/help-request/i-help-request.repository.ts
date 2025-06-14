import { User } from "../user/User.entity";
import { HelpRequest } from "./help-request.entity";
import { HelpRequestId } from "./help-request-id.value";
import { CreateHelpRequestInput } from "./create-help-request.shcema";

export interface IHelpRequestRepository {
  save(helpRequest: HelpRequest): Promise<HelpRequest>;
  findById(id: HelpRequestId): Promise<HelpRequest | null>;
  add(input: CreateHelpRequestInput, requester: User): Promise<HelpRequest>;
}