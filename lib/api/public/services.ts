import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/generated/schema";

export type Service = components["schemas"]["ServiceDto"];

/** Public, unauthenticated — the same list the marketing site's booking wizard uses. */
export function listServices(): Promise<Service[]> {
  return apiRequest<Service[]>("/api/v1/services");
}
