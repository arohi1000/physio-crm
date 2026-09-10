import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import type { components } from "@/lib/api/generated/schema";

export type PatientListItem = components["schemas"]["PatientListItemDto"];
export type PaginatedPatients = components["schemas"]["PaginatedPatientsDto"];
export type PatientDetail = components["schemas"]["PatientDetailDto"];
export type CreatePatientPayload = components["schemas"]["CreatePatientDto"];
export type UpdatePatientPayload = components["schemas"]["UpdatePatientDto"];

export type TimelineItem = PatientDetail["timeline"][number];
export type TimelineAppointmentItem = Extract<TimelineItem, { kind: "appointment" }>;
export type TimelineFollowUpItem = Extract<TimelineItem, { kind: "follow_up" }>;
export type TimelinePrescriptionItem = Extract<TimelineItem, { kind: "prescription" }>;
export type TimelineReceiptItem = Extract<TimelineItem, { kind: "receipt" }>;

const basePath = "/api/v1/admin/patients";

export type ListPatientsFilters = {
  search?: string;
  page?: number;
  limit?: number;
};

function toQueryString(filters: ListPatientsFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listPatients(
  request: AuthorizedRequest,
  filters: ListPatientsFilters = {},
): Promise<PaginatedPatients> {
  return request<PaginatedPatients>(`${basePath}${toQueryString(filters)}`);
}

export function getPatient(request: AuthorizedRequest, id: string): Promise<PatientDetail> {
  return request<PatientDetail>(`${basePath}/${id}`);
}

export function createPatient(
  request: AuthorizedRequest,
  payload: CreatePatientPayload,
): Promise<PatientDetail> {
  return request<PatientDetail>(basePath, { method: "POST", body: payload });
}

export function updatePatient(
  request: AuthorizedRequest,
  id: string,
  payload: UpdatePatientPayload,
): Promise<PatientDetail> {
  return request<PatientDetail>(`${basePath}/${id}`, { method: "PATCH", body: payload });
}

/** doctor_admin only — the API 403s for staff (M3-CONTRACT.md §3). */
export function deletePatient(request: AuthorizedRequest, id: string): Promise<void> {
  return request<void>(`${basePath}/${id}`, { method: "DELETE" });
}
