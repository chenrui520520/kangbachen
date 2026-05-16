type RequestSample = {
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  at: string;
};

const MAX_SAMPLES = 200;

const state = {
  requestSamples: [] as RequestSample[],
  failedAuth: 0,
  totalRequests: 0,
  latencySum: 0,
};

export const monitoringService = {
  recordRequest(sample: Omit<RequestSample, "at">) {
    state.totalRequests += 1;
    state.latencySum += sample.durationMs;
    state.requestSamples.push({ ...sample, at: new Date().toISOString() });
    if (state.requestSamples.length > MAX_SAMPLES) {
      state.requestSamples.shift();
    }
  },

  recordFailedAuth() {
    state.failedAuth += 1;
  },

  getSnapshot() {
    const recent = state.requestSamples.slice(-50);
    const avgLatency =
      state.totalRequests > 0 ? Math.round(state.latencySum / state.totalRequests) : 0;
    const errorCount = recent.filter((r) => r.statusCode >= 500).length;
    const p95 = percentile(
      recent.map((r) => r.durationMs),
      95,
    );

    return {
      totalRequests: state.totalRequests,
      failedAuth: state.failedAuth,
      avgLatencyMs: avgLatency,
      p95LatencyMs: p95,
      recentErrors: errorCount,
      recentRequests: recent,
    };
  },
};

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}
