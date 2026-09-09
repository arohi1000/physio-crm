"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/ApiError";
import { fetchHealth, type HealthResponse } from "@/lib/api/health";

type HealthCheckState =
  | { status: "loading" }
  | { status: "ok"; payload: HealthResponse }
  | { status: "error"; message: string };

export type UseHealthCheckResult = {
  state: HealthCheckState;
  retry: () => void;
};

function describe(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "The health check failed for an unexpected reason.";
}

export function useHealthCheck(): UseHealthCheckResult {
  const [state, setState] = useState<HealthCheckState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((previous) => previous + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchHealth(controller.signal)
      .then((payload) => setState({ status: "ok", payload }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({ status: "error", message: describe(error) });
      });

    return () => controller.abort();
  }, [attempt]);

  return { state, retry };
}
