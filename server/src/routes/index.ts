import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import { healthRoutes } from "./health.js";
import { apiV1Routes } from "./api/index.js";
import { getStorageRoot } from "../utils/storage.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(fastifyStatic, {
    root: getStorageRoot(),
    prefix: "/storage/",
    decorateReply: false,
  });

  await app.register(healthRoutes);
  await app.register(apiV1Routes, { prefix: "/api" });
}
