import { z } from 'zod';


export const HelpRequestIdSchema = z
  .string({
    invalid_type_error: 'ID must be a string.',
  })
  .regex(/^[A-Za-z0-9]{20}$/, {
    message: 'Invalid ID format. It must be a 20-character alphanumeric string.',
  });

export type HelpRequestIdPersistenceModel = z.infer<typeof HelpRequestIdSchema>;


export class HelpRequestId {

  private constructor(readonly value: string) {}

  public static create(value: string): HelpRequestId {
    const validatedId = HelpRequestIdSchema.parse(value);
    return new HelpRequestId(validatedId);
  }
  
  public equals(other: HelpRequestId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}