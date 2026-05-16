import { z } from "zod";

export const referralBindBodySchema = z.object({
  code: z.string().min(4).max(32),
});
