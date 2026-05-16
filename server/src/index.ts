import "./bootstrap-env.js";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import { loadEnv } from "./config/env.js";
import { registerErrorHandler } from "./middleware/error-handler.js";
import { registerPlugins } from "./plugins/index.js";
import { registerRoutes } from "./routes/index.js";
import { adminAuthService } from "./services/admin-auth.service.js";
import { monitoringService } from "./services/monitoring.service.js";

loadEnv();

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

async function main() {
  const app = Fastify({
    logger: true,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
  });

  registerErrorHandler(app);

  app.addHook("onRequest", (request, _reply, done) => {
    (request as { _startTime?: number })._startTime = Date.now();
    done();
  });

  app.addHook("onResponse", (request, reply, done) => {
    const start = (request as { _startTime?: number })._startTime ?? Date.now();
    const durationMs = Date.now() - start;
    monitoringService.recordRequest({
      method: request.method,
      url: request.url.split("?")[0] ?? request.url,
      statusCode: reply.statusCode,
      durationMs,
    });
    if (reply.statusCode === 401 && request.url.includes("/login")) {
      monitoringService.recordFailedAuth();
    }
    request.log.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs,
      },
      "request completed",
    );
    done();
  });

  await registerPlugins(app);
  await registerRoutes(app);

  await adminAuthService.seedDemoAdmins();

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutting down");
    await app.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  try {
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
