import { LocationSchema } from "../shared/value-object/Location.value";
import { IUserRepository } from "../user/i-user.repository";
import { UserId } from "../user/user-id.value";
import { HelpRequest } from "./help-request.entity";
import { IHelpRequestRepository } from "./i-help-request.repository";
import { IProximityVerificationNotifier } from "./service/i-proximity-verification.notifier";
import { Location } from "../shared/value-object/Location.value";

import { z } from "zod";
import { addMinutes } from "date-fns"; 
import { IClock } from "../shared/service/i-clock.service";
import { CandidatesCollection } from "./candidates.collection";
import { Candidate } from "./candidate.entity";
import { IProximityVerificationTimeoutScheduler } from "./service/i-proximity-verfication-timeout.scheduler";
import { IDeviceRepository } from "../device/i-device.repository";
import { DeviceId, DeviceIdSchema } from "../device/device-id.value";

export const CreateHelpRequestInputSchema = z.object({
  location: LocationSchema,
  deviceId: DeviceIdSchema
}).strict();


export type CreateHelpRequestInput = z.infer<typeof CreateHelpRequestInputSchema>;

export class CreateHelpRequestCommand {
  private constructor(
    public readonly requesterId: UserId,
    public readonly location: Location,
    public readonly deviceId: DeviceId,
    public readonly clock: IClock,
  ) {}

  static create(
    requesterId: UserId,
    location: Location,
    deviceId: DeviceId,
    clock: IClock,
  ): CreateHelpRequestCommand {
    return new CreateHelpRequestCommand(requesterId, location, deviceId, clock);
  }
}



export class CreateHelpRequestUseCase {
  public async execute(command: CreateHelpRequestCommand): Promise<HelpRequest> {
    const { requesterId } = command;

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new Error(`User with ID ${requesterId.value} does not exist.`);
    } 
    if (!command.location) {
      throw new Error("Location is required.");
    }
    if (!command.deviceId) {
      throw new Error("Device ID is required.");
    }

    const helpRequest = await this.helpRequestRepository.add(
      requester,
      command.location,
      command.deviceId
    );
    if (!helpRequest) {
      throw new Error("Failed to create help request.");
    }

    const nearByDevice = await this.deviceRepository.findAvailableNearBy(
      command.location,
      1000 // 1000 meters radius
    );
    if (nearByDevice.length === 0) {
      throw new Error("No nearby devices found.");
    }

    const nearByDeviceUniqueLatest = nearByDevice.toUniqueLatest();
    let candidates = CandidatesCollection.create();
    nearByDeviceUniqueLatest.all.forEach(device => {
      candidates = candidates.add(Candidate.create(device.ownerId, device.id));
    });

    const requesterDevice = await this.deviceRepository.findById(command.deviceId);
    if (!requesterDevice) {
      throw new Error(`Device with ID ${command.deviceId.value} does not exist.`);
    }
    const deviceToNotify = [...nearByDeviceUniqueLatest.all, requesterDevice];

    const addedHelpRequest = helpRequest.addCandidates(candidates);

    const proximityVerificationId = addedHelpRequest.proximityVerificationId;
    const expiredAt = addMinutes(command.clock.now(), 1); // 1 minute expiration

    for (const device of deviceToNotify) {
      this.notifier.send(device.id, proximityVerificationId, expiredAt);
    }

    await this.scheduler.schedule(
      addedHelpRequest.id,
      expiredAt
    );

    const requestedHelpRequest = addedHelpRequest.requestedProximityVerification();
    this.helpRequestRepository.save(requestedHelpRequest);

    return requestedHelpRequest;
  }


  private constructor(
    private readonly helpRequestRepository: IHelpRequestRepository,
    private readonly userRepository: IUserRepository,
    private readonly deviceRepository: IDeviceRepository,
    private readonly notifier: IProximityVerificationNotifier,
    private readonly scheduler: IProximityVerificationTimeoutScheduler
  ) {}

  static create(
    helpRequestRepository: IHelpRequestRepository,
    userRepository: IUserRepository,
    deviceRepository: IDeviceRepository,
    notifier: IProximityVerificationNotifier,
    scheduler: IProximityVerificationTimeoutScheduler
  ): CreateHelpRequestUseCase {
    return new CreateHelpRequestUseCase(
      helpRequestRepository,
      userRepository,
      deviceRepository,
      notifier,
      scheduler
    );
  }
}