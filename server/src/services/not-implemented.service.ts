import type { FastifyReply } from "fastify";
import { sendNotImplemented } from "../utils/response.js";

/**
 * Central place for "not implemented" domain responses.
 * Controllers should delegate here to keep HTTP semantics consistent.
 */
export const notImplementedService = {
  respond(reply: FastifyReply) {
    return sendNotImplemented(reply);
  },
};
