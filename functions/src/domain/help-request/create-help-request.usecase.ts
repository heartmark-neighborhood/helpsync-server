import {LocationSchema, Location} from "../shared/value-object/Location.value.js";
import {IUserRepository} from "../user/i-user.repository.js";
import {UserId} from "../user/user-id.value.js";
import {HelpRequest} from "./help-request.entity.js";
import {IHelpRequestRepository} from "./i-help-request.repository.js";
import {IProximityVerificationNotifier} from "./service/i-proximity-verification.notifier.js";

import {z} from "zod";
import {addMinutes} from "date-fns";
import {IClock} from "../shared/service/i-clock.service.js";
import {CandidatesCollection} from "./candidates.collection.js";
import {Candidate} from "./candidate.entity.js";
import {IProximityVerificationTimeoutScheduler} from "./service/i-proximity-verfication-timeout.scheduler.js";
import {IDeviceRepository} from "../device/i-device.repository.js";
import {DeviceId, DeviceIdSchema} from "../device/device-id.value.js";
import {UserInfo} from "./user-info.dto.js";
import {logger} from "firebase-functions";

export const CreateHelpRequestInputSchema = z.object({
  location: LocationSchema,
  deviceId: DeviceIdSchema,
  message: z.string().optional(),
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
    logger.info("CreateHelpRequestUseCase.execute called with command:", {requesterId: command.requesterId.value, location: command.location, deviceId: command.deviceId.value});
    const {requesterId} = command;

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      logger.warn(`Requester with ID ${requesterId.value} not found.`);
      throw new Error(`User with ID ${requesterId.value} does not exist.`);
    }
    logger.info("Requester found:", {requesterId: requester.id.value});

    if (!command.location) {
      logger.warn("Location is missing in command.");
      throw new Error("Location is required.");
    }
    if (!command.deviceId) {
      logger.warn("Device ID is missing in command.");
      throw new Error("Device ID is required.");
    }

    const helpRequest = await this.helpRequestRepository.add(
      requester,
      command.location,
      command.deviceId
    );
    if (!helpRequest) {
      logger.error("Failed to add help request to repository.");
      throw new Error("Failed to create help request.");
    }
    logger.info("Help request added to repository:", {helpRequestId: helpRequest.id.value});

    const nearByDevice = await this.deviceRepository.findAvailableNearBy(
      command.location,
      1000 // 1000 meters radius
    );
    logger.info("Found nearby devices:", {count: nearByDevice.length});

    if (nearByDevice.length === 0) {
      logger.warn("No nearby devices found.");
      throw new Error("No nearby devices found.");
    }

    const nearByDeviceUniqueLatest = nearByDevice.toUniqueLatest();
    logger.info("Unique latest nearby devices:", {count: nearByDeviceUniqueLatest.length});

    const userIds = nearByDeviceUniqueLatest.all.map((device) => device.ownerId);
    logger.info("User IDs from nearby devices:", {userIds: userIds.map((id) => id.value)});

    const users = await this.userRepository.findManyByIds(userIds);
    logger.info("Users found for nearby devices:", {count: users.length});

    let candidates = CandidatesCollection.create();
    for (const user of users) {
      const device = nearByDeviceUniqueLatest.getByOwnerId(user.id);
      if (device) {
        const userInfo = UserInfo.fromUser(user, device.id);
        const candidate = Candidate.create(
          userInfo,
          "pending",
        );
        candidates = candidates.add(candidate);
      }
    }
    logger.info("Candidates created:", {count: candidates.length});

    const addedHelpRequest = helpRequest.addCandidates(candidates);
    logger.info("Candidates added to help request.");

    const requesterDevice = await this.deviceRepository.findById(command.deviceId);
    if (!requesterDevice) {
      logger.warn(`Requester device with ID ${command.deviceId.value} not found.`);
      throw new Error(`Device with ID ${command.deviceId.value} does not exist.`);
    }
    logger.info("Requester device found.");

    const deviceToNotify = [...nearByDeviceUniqueLatest.all, requesterDevice];
    logger.info("Devices to notify:", {count: deviceToNotify.length});

    const proximityVerificationId = addedHelpRequest.proximityVerificationId;
    const expiredAt = addMinutes(command.clock.now(), 1); // 1 minute expiration
    logger.info("Proximity verification scheduled:", {proximityVerificationId: proximityVerificationId.value, expiredAt: expiredAt});

    for (const device of deviceToNotify) {
      this.notifier.send(device.deviceToken, addedHelpRequest.id, proximityVerificationId, expiredAt);
      logger.info("Notification sent to device:", {deviceId: device.id.value, deviceToken: device.deviceToken.value});
    }

    await this.scheduler.schedule(
      addedHelpRequest.id,
      expiredAt
    );
    logger.info("Scheduler task scheduled.");

    const requestedHelpRequest = addedHelpRequest.requestedProximityVerification();
    await this.helpRequestRepository.save(requestedHelpRequest);
    logger.info("Help request saved after proximity verification.");

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
