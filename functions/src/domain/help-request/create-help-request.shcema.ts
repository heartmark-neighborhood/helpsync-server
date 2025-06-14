import { z } from 'zod';

export const CreateHelpRequestInputSchema = z.object({
  location: z.object({
    latitude: z.number({
        required_error: 'Latitude is required.',
        invalid_type_error: 'Latitude must be a number.',
      })
      .min(-90, { message: 'Invalid latitude value.' })
      .max(90, { message: 'Invalid latitude value.' }),

    longitude: z.number({
        required_error: 'Longitude is required.',
        invalid_type_error: 'Longitude must be a number.',
      })
      .min(-180, { message: 'Invalid longitude value.' })
      .max(180, { message: 'Invalid longitude value.' }),
  })
}).strict();


export type CreateHelpRequestInput = z.infer<typeof CreateHelpRequestInputSchema>;