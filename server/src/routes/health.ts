import type { FastifyPluginAsync } from "fastify";
import { getRedis } from "../services/redis.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    const redis = getRedis();
    let redisOk = false;
    try {
      const pong = await redis.ping();
      redisOk = pong === "PONG";
    } catch {
      redisOk = false;
    }

    return {
      status: "ok",
      time: new Date().toISOString(),
      redis: redisOk ? "up" : "down",
    };
  });
};
