import {z} from "zod";

export const EvaluationSchema = z.object({
  /** 1から5の星評価 */
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  /** (将来拡張用) コメント */
  comment: z.string().optional(),
}).strict();

export interface Evaluation {
  /** 1から5の星評価 */
  rating: 1 | 2 | 3 | 4 | 5;
  /** (将来拡張用) コメント */
  comment?: string;
}
