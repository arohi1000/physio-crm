import { DocumentPdfButton } from "@/components/patients/DocumentPdfButton";
import { StatusBadge } from "@/components/StatusBadge";
import type { PatientDetail } from "@/lib/api/admin/patients";
import { getPrescriptionPdf } from "@/lib/api/admin/prescriptions";
import { getReceiptPdf } from "@/lib/api/admin/receipts";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import { formatClinicDateLabel, formatDateKeyLabel } from "@/lib/time/clinicTime";

const kindLabel: Record<PatientDetail["timeline"][number]["kind"], string> = {
  appointment: "Appointment",
  follow_up: "Follow-up",
  prescription: "Prescription",
  receipt: "Receipt",
};

/**
 * The API returns `timeline` already merged and newest-first across all four
 * kinds (M3-CONTRACT.md §4) — rendered here in that order, never re-sorted or
 * re-merged on the client.
 */
export function PatientTimeline({
  request,
  timeline,
}: {
  request: AuthorizedRequest;
  timeline: PatientDetail["timeline"];
}) {
  if (timeline.length === 0) {
    return <p className="text-ink-soft text-sm">No history recorded yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {timeline.map((item) => (
        <li key={`${item.kind}-${item.id}`} className="border-line rounded-md border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-ink-soft text-xs font-semibold tracking-widest uppercase">
              {kindLabel[item.kind]}
            </span>
            <span className="text-ink-soft text-xs">{formatClinicDateLabel(item.at)}</span>
          </div>

          {item.kind === "appointment" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-ink font-medium">
                {item.serviceName} &middot; {item.reference}
              </span>
              <StatusBadge status={item.status} />
            </div>
          ) : null}

          {item.kind === "follow_up" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-ink font-medium">{item.purpose}</span>
              <span className="text-ink-soft">
                Revisit by {formatDateKeyLabel(item.revisitTargetDate)} &middot;{" "}
                <StatusBadge status={item.status} />
              </span>
            </div>
          ) : null}

          {item.kind === "prescription" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-ink font-medium">{item.summary}</span>
              <DocumentPdfButton
                label="View PDF"
                fetchUrl={() => getPrescriptionPdf(request, item.id)}
              />
            </div>
          ) : null}

          {item.kind === "receipt" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-ink font-medium">
                {item.number} &middot; ₹{item.amount} &middot; {item.paymentMethod}
              </span>
              <DocumentPdfButton
                label="View PDF"
                fetchUrl={() => getReceiptPdf(request, item.id)}
              />
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
