"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Pagination } from "@/components/ui/Pagination";
import { listFollowUps, updateFollowUp, type FollowUpStatus } from "@/lib/api/admin/followUps";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { useSession } from "@/lib/auth/useSession";
import { formatClinicDateLabel, formatDateKeyLabel } from "@/lib/time/clinicTime";

const PAGE_SIZE = 25;

const statusLabel: Record<FollowUpStatus, string> = {
  scheduled: "Scheduled",
  reminder_sent: "Reminder sent",
  rebooked: "Rebooked",
  dismissed: "Dismissed",
};

export default function FollowUpsPage() {
  const { request } = useSession();

  const [status, setStatus] = useState<FollowUpStatus | "">("");
  const [dueBefore, setDueBefore] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string>();

  const filters = useMemo(
    () => ({
      status: status || undefined,
      dueBefore: dueBefore || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [status, dueBefore, page],
  );

  const { data, error, isLoading, reload } = useApiResource(
    () => listFollowUps(request, filters),
    [request, filters.status, filters.dueBefore, filters.page],
  );

  async function setFollowUpStatus(id: string, nextStatus: FollowUpStatus) {
    setActionError(undefined);
    try {
      await updateFollowUp(request, id, { status: nextStatus });
      reload();
    } catch {
      setActionError("That didn't go through. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-ink text-2xl font-semibold">Follow-ups</h1>
        <p className="text-ink-soft text-sm">
          The queue of revisits due, filterable by status and date.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="follow-up-status-filter">
          <Select
            id="follow-up-status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as FollowUpStatus | "");
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {(Object.keys(statusLabel) as FollowUpStatus[]).map((key) => (
              <option key={key} value={key}>
                {statusLabel[key]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due before" htmlFor="follow-up-due-filter">
          <TextInput
            id="follow-up-due-filter"
            type="date"
            value={dueBefore}
            onChange={(event) => {
              setDueBefore(event.target.value);
              setPage(1);
            }}
          />
        </Field>
      </div>

      {error ? (
        <InlineAlert tone="error" title="Couldn't load follow-ups">
          {error.message}
        </InlineAlert>
      ) : null}
      {actionError ? <InlineAlert tone="error" title={actionError} /> : null}

      {isLoading ? (
        <p className="text-ink-soft text-sm">Loading follow-ups…</p>
      ) : (
        <>
          <div className="border-line overflow-x-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="border-line text-ink-soft border-b text-xs tracking-widest uppercase">
                <tr>
                  <th className="px-3 py-2 font-semibold">Purpose</th>
                  <th className="px-3 py-2 font-semibold">Revisit target</th>
                  <th className="px-3 py-2 font-semibold">Reminder scheduled for</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Patient</th>
                  <th className="px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {(data?.data ?? []).map((followUp) => (
                  <tr key={followUp.id}>
                    <td className="px-3 py-2">{followUp.purpose}</td>
                    <td className="text-ink-soft px-3 py-2">
                      {formatDateKeyLabel(followUp.revisitTargetDate)}
                    </td>
                    <td className="text-ink-soft px-3 py-2">
                      {formatClinicDateLabel(followUp.reminderScheduledFor)}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={statusLabel[followUp.status]} />
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/patients/${followUp.patientId}`}
                        className="text-sage-deep hover:underline"
                      >
                        View patient
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {followUp.status !== "rebooked" ? (
                          <Button
                            variant="quiet"
                            onClick={() => void setFollowUpStatus(followUp.id, "rebooked")}
                          >
                            Mark rebooked
                          </Button>
                        ) : null}
                        {followUp.status !== "dismissed" ? (
                          <Button
                            variant="quiet"
                            onClick={() => void setFollowUpStatus(followUp.id, "dismissed")}
                          >
                            Dismiss
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data && data.data.length === 0 ? (
              <p className="text-ink-soft p-3 text-sm">Nothing in the queue for this filter.</p>
            ) : null}
          </div>
          {data ? (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
              itemLabel="follow-up"
            />
          ) : null}
        </>
      )}
    </div>
  );
}
