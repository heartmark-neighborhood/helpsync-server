import { z } from 'zod';
import { HelpRequestId, HelpRequestIdSchema } from './help-request-id.value';
import { UserId, UserIdSchema } from '../user/user-id.value';
import { IHelpRequestRepository } from './i-help-request.repository';

export const HandleProximityVerificationResultInputSchema = z.object({
  helpRequestId: HelpRequestIdSchema,
  userId: UserIdSchema,
  verificationResult: z.boolean(),
});

export type HandleProximityVerificationResultInput = z.infer<typeof HandleProximityVerificationResultInputSchema>;


export class HandleProximityVerificationResultCommand {
  private constructor(
    public readonly helpRequestId: HelpRequestId,
    public readonly userId: UserId,
    public readonly verificationResult: boolean,
  ) {}

  static create(input: HandleProximityVerificationResultInput): HandleProximityVerificationResultCommand {
    const { helpRequestId, userId, verificationResult } = input;
    return new HandleProximityVerificationResultCommand(
      HelpRequestId.create(helpRequestId),
      UserId.create(userId),
      verificationResult,
    );
  }
}


export class HandleProximityVerificationResultUseCase {
  constructor(private readonly repository: IHelpRequestRepository) {}

  async execute(input: HandleProximityVerificationResultCommand): Promise<void> {
    try {
      const { helpRequestId, userId, verificationResult } = input;
      const result = await this.repository.findWithRequesterInfoById(helpRequestId);
      if (!result) {
        throw new Error(`Help request with ID ${helpRequestId.value} not found`);
      }
      const helpRequest = result.helpRequest;
      const updateHelpRequest = await helpRequest.handleProximityVerificationResult(userId, verificationResult);
      if (!updateHelpRequest) {
        throw new Error('Failed to handle proximity verification result');
      }

      await this.repository.save(updateHelpRequest);
      console.log(`Proximity verification result for user ${userId.value} processed successfully.`);
    } catch (error) {
      console.error('Error handling proximity verification result:', error);
      throw new Error('Failed to handle proximity verification result');
    }
  }
}