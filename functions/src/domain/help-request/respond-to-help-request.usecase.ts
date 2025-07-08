import { z } from 'zod';
import { HelpRequestIdSchema } from './help-request-id.value';

export const RespondToHelpRequestInputSchema = z.object({
    helpRequestId : HelpRequestIdSchema,
    response : z.string().regex(/accept|decline/,{message :'This parameter only accepts accept or decline'})
})

export class 