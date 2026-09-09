import { http, HttpResponse } from "msw";
import { apiBaseUrl } from "@/lib/api/config";
import type { HealthResponse } from "@/lib/api/health";

/**
 * Stand-ins for endpoints the CRM needs before `physio-api` ships them. Each
 * handler is deleted in the milestone that makes the real endpoint available.
 */
export const handlers = [
  http.get(`${apiBaseUrl}/api/v1/health`, () =>
    HttpResponse.json<HealthResponse>({
      status: "ok",
      version: "mock",
    }),
  ),
];
