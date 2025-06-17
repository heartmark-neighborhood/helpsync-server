import { HelpRequest } from "./help-request.entity";
import { HelpRequestId } from "./help-request-id.value";
import { CreateHelpRequestCommand } from "./create-help-request.usecase";

export interface IHelpRequestRepository {
  save(helpRequest: HelpRequest): Promise<HelpRequest>;
  findById(id: HelpRequestId): Promise<HelpRequest | null>;
  add(command: CreateHelpRequestCommand): Promise<HelpRequest>;
}