import { IUserRepository } from "../user/i-user.repository";
import { UserId } from "../user/user-id.value";
import { CreateHelpRequestInput } from "./create-help-request.shcema";
import { HelpRequest } from "./help-request.entity";
import { IHelpRequestRepository } from "./i-help-request.repository";
import { IProximityVerificationNotifier } from "./service/i-proximity-verification.notifier";


export class CreateHelpRequestUseCase {
  public async execute(input: CreateHelpRequestInput, requesterId: UserId): Promise<HelpRequest> {
    throw new Error("Not implemented");
  }


  constructor(
    private readonly helpRequestRepository: IHelpRequestRepository,
    private readonly userRepository: IUserRepository,
    private readonly notifier: IProximityVerificationNotifier
  ) {}

  static create(
    helpRequestRepository: IHelpRequestRepository,
    userRepository: IUserRepository,
    notifier: IProximityVerificationNotifier
  ): CreateHelpRequestUseCase {
    return new CreateHelpRequestUseCase(
      helpRequestRepository,
      userRepository,
      notifier
    );
  }
}