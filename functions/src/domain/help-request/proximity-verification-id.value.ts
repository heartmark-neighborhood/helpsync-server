import { z } from 'zod';
import { randomUUID } from 'crypto';

const ProximityVerificationIdSchema = z.string(
  {
    invalid_type_error: 'ID must be a string.',
  }
).uuid({
  message: 'Invalid ID format. It must be a valid UUID.',
});

export class ProximityVerificationId {
  private constructor(readonly value: string) {}
  public static create(value?: string): ProximityVerificationId {
    const id = value || randomUUID();
    const validatedId = ProximityVerificationIdSchema.parse(id);
    return new ProximityVerificationId(validatedId);
  }
}