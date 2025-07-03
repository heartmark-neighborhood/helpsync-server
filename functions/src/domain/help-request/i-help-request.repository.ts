import { HelpRequest } from "./help-request.entity";
import { HelpRequestId } from "./help-request-id.value";
import { User } from "../user/User.entity";
import { DeviceId } from "../device/device-id.value";
import { Location } from "../shared/value-object/Location.value";
import { UserInfo } from "./user-info.dto";

export interface HelpRequestWithRequesterInfo {
  helpRequest: HelpRequest;
  requester: UserInfo;
}

export interface IHelpRequestRepository {
  save(helpRequest: HelpRequest): Promise<HelpRequest>;
  findWithRequesterInfoById(id: HelpRequestId): Promise<HelpRequestWithRequesterInfo | null>;
  add(requester: User, requestedLocation: Location, requestedDeviceId: DeviceId): Promise<HelpRequest>;
}