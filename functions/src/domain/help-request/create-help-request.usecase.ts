import { LocationSchema } from "../shared/value-object/Location.value";
import { IUserRepository } from "../user/i-user.repository";
import { UserId } from "../user/user-id.value";
import { HelpRequest } from "./help-request.entity";
import { IHelpRequestRepository } from "./i-help-request.repository";
import { IProximityVerificationNotifier } from "./service/i-proximity-verification.notifier";
import { Location } from "../shared/value-object/Location.value";

import { z } from "zod";
import { addSeconds } from "date-fns"; 
import { IClock } from "../shared/service/i-clock.value";

export const CreateHelpRequestInputSchema = z.object({
  location: LocationSchema,
}).strict();


export type CreateHelpRequestInput = z.infer<typeof CreateHelpRequestInputSchema>;

export class CreateHelpRequestCommand {
  private constructor(
    public readonly requesterId: UserId,
    public readonly location: Location,
    public readonly clock: IClock,
  ) {}

  static create(
    requesterId: UserId,
    location: Location,
    clock: IClock,
  ): CreateHelpRequestCommand {
    return new CreateHelpRequestCommand(requesterId, location, clock);
  }
}



export class CreateHelpRequestUseCase {
  public async execute(command: CreateHelpRequestCommand): Promise<HelpRequest> {
    const { requesterId } = command;

    const user = await this.userRepository.findById(requesterId);
    if (!user) {
      throw new Error(`User with ID ${requesterId.value} does not exist.`);
    } 

    const helpRequest = await this.helpRequestRepository.add(command);
    if (!helpRequest) {
      throw new Error("Failed to create help request.");
    }

    const nearbyUsers = await this.userRepository.findAvailableSupporters(
      command.location,
      1000 // 1000 meters radius
    );

    const proximityVerificationId = helpRequest.proximityVerificationId;
    const expiredAt = addSeconds(command.clock.now(), 60);

    if (nearbyUsers.length === 0) {
      //TODO: 例外でなく通知送信の形で
      throw new Error("No nearby users found to notify.");
    }

    await this.notifier.send(requesterId, proximityVerificationId, expiredAt);
    for (const user of nearbyUsers) {
      await this.notifier.send(user.id, proximityVerificationId, expiredAt);
    }

    return helpRequest;
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