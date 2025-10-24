import {z} from "zod";

export const EvaluationSchema = z.object({
  /** 1から5の星評価 */
  rating: z.number().int().min(1).max(5),
  /** (将来拡張用) コメント */
  comment: z.string().optional(),
}).strict();

export interface Evaluation {
  /** 1から5の星評価 */
  rating: 1 | 2 | 3 | 4 | 5;
  /** (将来拡張用) コメント */
  comment?: string;
}
