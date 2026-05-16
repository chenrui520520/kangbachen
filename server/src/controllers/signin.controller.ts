import type { FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "../utils/response.js";
import { signinService } from "../services/signin.service.js";
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

export const signinController = {
  status: (req: FastifyRequest, reply: FastifyReply) =>
    run(() => signinService.getStatus(userId(req)), reply),

  claim: (req: FastifyRequest, reply: FastifyReply) =>
    run(() => signinService.claim(userId(req)), reply),

  history: (req: FastifyRequest, reply: FastifyReply) =>
    run(() => signinService.history(userId(req)), reply),
};
