import { z } from "zod";

export const RequesterProfileSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  iconUrl: z.string().url("Icon URL must be a valid URL").optional(),
  physicalDescription: z.string().max(500, "Physical description must be 500 characters or less").optional(),
}).strict();

export type RequesterProfile = z.infer<typeof RequesterProfileSchema>;

export class RequesterProfileDto {
  private constructor(
    public readonly nickname: string,
    public readonly iconUrl?: string,
    public readonly physicalDescription?: string,
  ) {}

  static from(requesterProfile: RequesterProfile): RequesterProfileDto {
    return new RequesterProfileDto(
      requesterProfile.nickname,
      requesterProfile.iconUrl,
      requesterProfile.physicalDescription,
    );
  }
}