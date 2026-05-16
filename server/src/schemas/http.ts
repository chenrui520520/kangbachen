import { z } from "zod";

/** Unified JSON body for endpoints that are not implemented yet. */
export const notImplementedBodySchema = z.object({
  success: z.literal(false),
  code: z.literal(501),
  message: z.literal("Not Implemented Yet"),
});

export type NotImplementedBody = z.infer<typeof notImplementedBodySchema>;

export const NOT_IMPLEMENTED_BODY: NotImplementedBody = {
  success: false,
  code: 501,
  message: "Not Implemented Yet",
};
