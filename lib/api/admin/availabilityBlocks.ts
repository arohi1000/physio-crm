import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import type { components } from "@/lib/api/generated/schema";

export type AvailabilityBlock = components["schemas"]["AvailabilityBlockDto"];
export type AvailabilityBlockWithWarnings = Omit<AvailabilityBlock, never> &
  Pick<components["schemas"]["AvailabilityBlockWithWarningsDto"], "affectedAppointments">;
export type CreateAvailabilityBlockPayload = components["schemas"]["CreateAvailabilityBlockDto"];
export type AffectedAppointment = components["schemas"]["AffectedAppointmentDto"];

const basePath = "/api/v1/admin/availability-blocks";

export function listAvailabilityBlocks(
  request: AuthorizedRequest,
  from: string,
  to: string,
): Promise<AvailabilityBlock[]> {
  const params = new URLSearchParams({ from, to });
  return request<AvailabilityBlock[]>(`${basePath}?${params.toString()}`);
}

/**
 * Always succeeds even when the block overlaps existing bookings
 * (M2-CONTRACT.md §3) — the response's `affectedAppointments` reports which
 * bookings sit inside the window; it never cancels them.
 */
export function createAvailabilityBlock(
  request: AuthorizedRequest,
  payload: CreateAvailabilityBlockPayload,
): Promise<AvailabilityBlockWithWarnings> {
  return request<AvailabilityBlockWithWarnings>(basePath, { method: "POST", body: payload });
}

export function deleteAvailabilityBlock(request: AuthorizedRequest, id: string): Promise<void> {
  return request<void>(`${basePath}/${id}`, { method: "DELETE" });
}
