import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import type { components } from "@/lib/api/generated/schema";

export type ReceiptDetail = components["schemas"]["ReceiptDetailDto"];
export type CreateReceiptPayload = components["schemas"]["CreateReceiptDto"];
export type SignedFileUrl = components["schemas"]["SignedFileUrlResponseDto"];

const patientsBasePath = "/api/v1/admin/patients";
const basePath = "/api/v1/admin/receipts";

export function createReceipt(
  request: AuthorizedRequest,
  patientId: string,
  payload: CreateReceiptPayload,
): Promise<ReceiptDetail> {
  return request<ReceiptDetail>(`${patientsBasePath}/${patientId}/receipts`, {
    method: "POST",
    body: payload,
  });
}

export function getReceipt(request: AuthorizedRequest, id: string): Promise<ReceiptDetail> {
  return request<ReceiptDetail>(`${basePath}/${id}`);
}

/**
 * The URL is short-lived and single-purpose (M3-CONTRACT.md §5) — call this
 * on demand when the doctor asks for the PDF, never cache the result into a
 * page that might sit open past the URL's expiry.
 */
export function getReceiptPdf(request: AuthorizedRequest, id: string): Promise<SignedFileUrl> {
  return request<SignedFileUrl>(`${basePath}/${id}/pdf`);
}
