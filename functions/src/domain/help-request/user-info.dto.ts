import { DeviceId, DeviceIdSchema } from "../device/device-id.value";
import { UserId, UserIdSchema } from "../user/user-id.value";

import { z } from "zod";
import { User } from "../user/User.entity";

export const UserInfoSchema = z.object({
  id: UserIdSchema,
  nickname: z.string(),
  physicalDescription: z.string(),
  iconUrl: z.string(),
  deviceId: DeviceIdSchema
});

export type UserInfoDTO = z.infer<typeof UserInfoSchema>;

export class UserInfo {
  private constructor(
    public readonly id: UserId,
    public readonly nickname: string,
    public readonly physicalDescription: string,
    public readonly iconUrl: string,
    public readonly deviceId: DeviceId
  ) {}

  static create(dto: UserInfoDTO): UserInfo {
    return new UserInfo(
      UserId.create(dto.id),
      dto.nickname,
      dto.physicalDescription,
      dto.iconUrl,
      DeviceId.create(dto.deviceId)
    );
  }

  static fromPersistenceModel(model: UserInfoDTO): UserInfo {
    return UserInfo.create(model);
  }

  static fromUser(user: User, deviceId: DeviceId): UserInfo {
    return new UserInfo(
      user.id,
      user.nickname,
      user.physicalFeatures,
      user.iconUrl,
      deviceId
    );
  }

}