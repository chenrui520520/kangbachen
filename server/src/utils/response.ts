import type { FastifyReply } from "fastify";
import { NOT_IMPLEMENTED_BODY, notImplementedBodySchema } from "../schemas/http.js";

export type SuccessBody<T> = {
  success: true;
  data: T;
};

export function sendSuccess<T>(reply: FastifyReply, statusCode: number, data: T) {
  const body: SuccessBody<T> = { success: true, data };
  return reply.status(statusCode).send(body);
}

export function sendNotImplemented(reply: FastifyReply) {
  const body = notImplementedBodySchema.parse(NOT_IMPLEMENTED_BODY);
  return reply.status(501).send(body);
}

export function sendJson<T>(reply: FastifyReply, statusCode: number, payload: T) {
  return reply.status(statusCode).send(payload as never);
}
