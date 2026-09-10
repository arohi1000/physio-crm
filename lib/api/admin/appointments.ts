import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import type { components } from "@/lib/api/generated/schema";

export type AppointmentStatus = "booked" | "completed" | "cancelled" | "no_show";
export type ReasonForVisit = components["schemas"]["CreateAdminAppointmentDto"]["reasonForVisit"];
export type PaymentPreference = "online" | "clinic";

export type AdminAppointmentListItem = components["schemas"]["AdminAppointmentListItemDto"];
export type AdminAppointmentDetail = components["schemas"]["AdminAppointmentDetailDto"];
export type PaginatedAdminAppointments = components["schemas"]["PaginatedAdminAppointmentsDto"];

export type CreateAdminAppointmentPayload = Omit<
  components["schemas"]["CreateAdminAppointmentDto"],
  "couponCode" | "patient"
> & {
  couponCode?: string | null;
  patient: Omit<components["schemas"]["PatientDetailsDto"], "email"> & { email?: string | null };
};
export type UpdateAppointmentPayload = components["schemas"]["UpdateAppointmentDto"];

const basePath = "/api/v1/admin/appointments";

export type ListAppointmentsFilters = {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  serviceId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function toQueryString(filters: ListAppointmentsFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listAppointments(
  request: AuthorizedRequest,
  filters: ListAppointmentsFilters = {},
): Promise<PaginatedAdminAppointments> {
  return request<PaginatedAdminAppointments>(`${basePath}${toQueryString(filters)}`);
}

const CALENDAR_PAGE_SIZE = 100;

/**
 * The calendar needs every appointment in a visible range, not one page of
 * it — a single clinic rarely exceeds a page per month, but a template that
 * silently truncated at 100 would be exactly the kind of "quietly useless"
 * bug the timezone brief warns about, so this pages through until it has all
 * of them.
 */
export async function listAllAppointmentsInRange(
  request: AuthorizedRequest,
  filters: Omit<ListAppointmentsFilters, "page" | "limit">,
): Promise<AdminAppointmentListItem[]> {
  const items: AdminAppointmentListItem[] = [];
  let page = 1;
  for (;;) {
    const result = await listAppointments(request, { ...filters, page, limit: CALENDAR_PAGE_SIZE });
    items.push(...result.data);
    if (page >= result.meta.totalPages || result.data.length === 0) {
      return items;
    }
    page += 1;
  }
}

export function getAppointment(
  request: AuthorizedRequest,
  id: string,
): Promise<AdminAppointmentDetail> {
  return request<AdminAppointmentDetail>(`${basePath}/${id}`);
}

export function createAppointment(
  request: AuthorizedRequest,
  payload: CreateAdminAppointmentPayload,
): Promise<AdminAppointmentDetail> {
  return request<AdminAppointmentDetail>(basePath, { method: "POST", body: payload });
}

export function updateAppointment(
  request: AuthorizedRequest,
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<AdminAppointmentDetail> {
  return request<AdminAppointmentDetail>(`${basePath}/${id}`, { method: "PATCH", body: payload });
}

export function cancelAppointment(
  request: AuthorizedRequest,
  id: string,
  reason: string,
): Promise<AdminAppointmentDetail> {
  return request<AdminAppointmentDetail>(`${basePath}/${id}/cancel`, {
    method: "POST",
    body: { reason },
  });
}
