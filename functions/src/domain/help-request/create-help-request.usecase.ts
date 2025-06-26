import { LocationSchema } from "../shared/value-object/Location.value";
import { IUserRepository } from "../user/i-user.repository";
import { UserId } from "../user/user-id.value";
import { HelpRequest } from "./help-request.entity";
import { IHelpRequestRepository } from "./i-help-request.repository";
import { IProximityVerificationNotifier } from "./service/i-proximity-verification.notifier";
import { Location } from "../shared/value-object/Location.value";

import { z } from "zod";
import { addSeconds } from "date-fns"; 
import { IClock } from "../shared/service/i-clock.service";
import { CandidatesCollection } from "./candidates.collection";
import { Candidate } from "./candidate.entity";

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

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
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

    if (nearbyUsers.length === 0) {
      //TODO: 例外でなく通知送信の形で
      throw new Error("No nearby users found to notify.");
    }

    const candidateUserIds =  nearbyUsers.map(user => user.id);
    const candidates = CandidatesCollection.create(
      candidateUserIds.map(userId => Candidate.create(userId,))
    );
    const addedHelpRequest = helpRequest.addCandidates(candidates);

    const proximityVerificationId = addedHelpRequest.proximityVerificationId;
    const expiredAt = addSeconds(command.clock.now(), 60); // 60 seconds expiration

    await this.notifier.send(requesterId, proximityVerificationId, expiredAt);
    for (const user of nearbyUsers) {
      await this.notifier.send(user.id, proximityVerificationId, expiredAt);
    }

    const requestedHelpRequest = addedHelpRequest.requestedProximityVerification();
    this.helpRequestRepository.save(requestedHelpRequest, requester);

    return requestedHelpRequest;
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