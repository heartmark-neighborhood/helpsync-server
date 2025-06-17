import { LocationSchema } from "../shared/value-object/Location.value";
import { IUserRepository } from "../user/i-user.repository";
import { UserId } from "../user/user-id.value";
import { HelpRequest } from "./help-request.entity";
import { IHelpRequestRepository } from "./i-help-request.repository";
import { IProximityVerificationNotifier } from "./service/i-proximity-verification.notifier";
import { Location } from "../shared/value-object/Location.value";

import { z } from "zod";


export const CreateHelpRequestInputSchema = z.object({
  location: LocationSchema,
}).strict();


export type CreateHelpRequestInput = z.infer<typeof CreateHelpRequestInputSchema>;

export class CreateHelpRequestCommand {
  private constructor(
    public readonly requesterId: UserId,
    public readonly location: Location,
    public readonly createdAt: Date,
  ) {}

  static create(
    requesterId: UserId,
    location: Location,
    createdAt: Date
  ): CreateHelpRequestCommand {
    return new CreateHelpRequestCommand(requesterId, location, createdAt);
  }
}



export class CreateHelpRequestUseCase {
  public async execute(command: CreateHelpRequestCommand): Promise<HelpRequest> {
    throw new Error("Not implemented");
  }


  private constructor(
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