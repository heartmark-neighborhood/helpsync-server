import {HelpRequest} from "./help-request.entity.js";
import {HelpRequestId} from "./help-request-id.value.js";
import {User} from "../user/User.entity.js";
import {DeviceId} from "../device/device-id.value.js";
import {Location} from "../shared/value-object/Location.value.js";
import {UserInfo} from "./user-info.dto.js";

export interface HelpRequestWithRequesterInfo {
  helpRequest: HelpRequest;
  requester: UserInfo;
}

export interface IHelpRequestRepository {
  save(helpRequest: HelpRequest): Promise<HelpRequest>;
  findWithRequesterInfoById(id: HelpRequestId): Promise<HelpRequestWithRequesterInfo | null>;
  add(requester: User, requestedLocation: Location, requestedDeviceId: DeviceId): Promise<HelpRequest>;
}
