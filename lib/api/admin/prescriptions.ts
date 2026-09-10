import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import type { components } from "@/lib/api/generated/schema";

export type PrescriptionMedicine = components["schemas"]["PrescriptionMedicineDto"];
export type PrescriptionExercise = components["schemas"]["PrescriptionExerciseDto"];
export type PrescriptionDetail = components["schemas"]["PrescriptionDetailDto"];
export type CreatePrescriptionPayload = components["schemas"]["CreatePrescriptionDto"];
export type SignedFileUrl = components["schemas"]["SignedFileUrlResponseDto"];

const patientsBasePath = "/api/v1/admin/patients";
const basePath = "/api/v1/admin/prescriptions";

export function createPrescription(
  request: AuthorizedRequest,
  patientId: string,
  payload: CreatePrescriptionPayload,
): Promise<PrescriptionDetail> {
  return request<PrescriptionDetail>(`${patientsBasePath}/${patientId}/prescriptions`, {
    method: "POST",
    body: payload,
  });
}

export function getPrescription(
  request: AuthorizedRequest,
  id: string,
): Promise<PrescriptionDetail> {
  return request<PrescriptionDetail>(`${basePath}/${id}`);
}

/**
 * The URL is short-lived and single-purpose (M3-CONTRACT.md §5) — call this
 * on demand when the doctor asks for the PDF, never cache the result into a
 * page that might sit open past the URL's expiry.
 */
export function getPrescriptionPdf(request: AuthorizedRequest, id: string): Promise<SignedFileUrl> {
  return request<SignedFileUrl>(`${basePath}/${id}/pdf`);
}
