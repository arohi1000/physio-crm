import { apiRequest } from "./client";

/**
 * Hand-written for Milestone 0 because the API has not published an
 * `openapi.json` yet. Once `npm run generate:api-types` has run, this shape
 * comes from `lib/api/generated/schema.ts` instead.
 */
export type HealthResponse = {
  status: string;
  uptime?: number;
  version?: string;
};

export function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/api/v1/health", { signal });
}
