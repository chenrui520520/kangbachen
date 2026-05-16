import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { HttpError } from "../errors/http-error.js";
import { logger } from "../utils/logger.js";

export function registerErrorHandler(app: {
  setErrorHandler: (
    handler: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => void,
  ) => void;
}) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        code: 400,
        message: "Validation Error",
        details: error.flatten(),
      });
    }

    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({
        success: false,
        code: error.statusCode,
        message: error.message,
        details: error.details,
      });
    }

    const statusCode = error.statusCode ?? 500;
    logger.error(
      {
        err: error,
        reqId: request.id,
        url: request.url,
        method: request.method,
      },
      "request failed",
    );

    if (statusCode >= 500) {
      return reply.status(statusCode).send({
        success: false,
        code: statusCode,
        message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
      });
    }

    return reply.status(statusCode).send({
      success: false,
      code: statusCode,
      message: error.message,
    });
  });
}
