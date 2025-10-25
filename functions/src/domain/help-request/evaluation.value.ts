import {z} from "zod";

export const EvaluationSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
}).strict();

export interface Evaluation {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}
