import { apiRequest } from "@/lib/api/client";
import type { components } from "@/lib/api/generated/schema";

export type AvailabilityResponse = components["schemas"]["AvailabilityResponseDto"];
export type Slot = components["schemas"]["SlotDto"];

/**
 * Public, unauthenticated — the same slot engine the guest booking wizard
 * calls, reused here for manual/walk-in booking and reschedule so the CRM
 * never re-implements slot math. `date` is a clinic-local calendar date
 * (`YYYY-MM-DD`); an empty `slots` array is a valid non-error response.
 */
export function getAvailability(serviceId: string, date: string): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({ serviceId, date });
  return apiRequest<AvailabilityResponse>(`/api/v1/availability?${params.toString()}`);
}
