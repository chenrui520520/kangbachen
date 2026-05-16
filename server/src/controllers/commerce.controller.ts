import type { FastifyReply, FastifyRequest } from "fastify";
import { shopPurchaseBodySchema } from "../schemas/engagement.js";
import { sendSuccess } from "../utils/response.js";
import { shopService } from "../services/shop.service.js";
import { HttpError } from "../errors/http-error.js";

function userId(req: FastifyRequest) {
  const id = req.authUser?.sub;
  if (!id) throw new HttpError(401, "Unauthorized");
  return id;
}

async function run<T>(handler: () => Promise<T>, reply: FastifyReply) {
  try {
    return sendSuccess(reply, 200, await handler());
  } catch (err) {
    if (err instanceof HttpError) {
      return reply.status(err.statusCode).send({
        success: false,
        code: err.statusCode,
        message: err.message,
        details: err.details,
      });
    }
    throw err;
  }
}

export const commerceController = {
  shop: (_req: FastifyRequest, reply: FastifyReply) =>
    run(() => shopService.listItems(), reply),

  shopPurchase: (req: FastifyRequest, reply: FastifyReply) =>
    run(async () => {
      const body = shopPurchaseBodySchema.parse(req.body);
      return shopService.purchase(userId(req), body.shopItemId);
    }, reply),
};
