import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import type { components } from "@/lib/api/generated/schema";

export type FollowUpStatus = components["schemas"]["FollowUpResponseDto"]["status"];
export type FollowUp = components["schemas"]["FollowUpResponseDto"];
export type PaginatedFollowUps = components["schemas"]["PaginatedFollowUpsDto"];
export type CreateFollowUpPayload = components["schemas"]["CreateFollowUpDto"];
export type UpdateFollowUpPayload = components["schemas"]["UpdateFollowUpDto"];

const patientsBasePath = "/api/v1/admin/patients";
const basePath = "/api/v1/admin/follow-ups";

export type ListFollowUpsFilters = {
  status?: FollowUpStatus;
  dueBefore?: string;
  page?: number;
  limit?: number;
};

function toQueryString(filters: ListFollowUpsFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listFollowUps(
  request: AuthorizedRequest,
  filters: ListFollowUpsFilters = {},
): Promise<PaginatedFollowUps> {
  return request<PaginatedFollowUps>(`${basePath}${toQueryString(filters)}`);
}

export function createFollowUp(
  request: AuthorizedRequest,
  patientId: string,
  payload: CreateFollowUpPayload,
): Promise<FollowUp> {
  return request<FollowUp>(`${patientsBasePath}/${patientId}/follow-ups`, {
    method: "POST",
    body: payload,
  });
}

export function updateFollowUp(
  request: AuthorizedRequest,
  id: string,
  payload: UpdateFollowUpPayload,
): Promise<FollowUp> {
  return request<FollowUp>(`${basePath}/${id}`, { method: "PATCH", body: payload });
}
