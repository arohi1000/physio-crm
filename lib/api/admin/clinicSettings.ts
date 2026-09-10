import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import type { components } from "@/lib/api/generated/schema";

export type ClinicSettings = components["schemas"]["ClinicSettingsDto"];
export type UpdateClinicSettingsPayload = components["schemas"]["UpdateClinicSettingsDto"];
export type WeeklyWorkingHours = components["schemas"]["WeeklyWorkingHoursDto"];
export type WorkingInterval = components["schemas"]["WorkingIntervalDto"];

const basePath = "/api/v1/admin/clinic-settings";

/** `doctor_admin` and `staff` can both read; only `doctor_admin` can write (API-enforced, 403 otherwise). */
export function getClinicSettings(request: AuthorizedRequest): Promise<ClinicSettings> {
  return request<ClinicSettings>(basePath);
}

export function updateClinicSettings(
  request: AuthorizedRequest,
  payload: UpdateClinicSettingsPayload,
): Promise<ClinicSettings> {
  return request<ClinicSettings>(basePath, { method: "PUT", body: payload });
}
