"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Textarea, TextInput } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  type AvailabilityBlockWithWarnings,
} from "@/lib/api/admin/availabilityBlocks";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import {
  clinicPartsToUtcIso,
  clinicTodayDateKey,
  formatClinicDateLabel,
  formatClinicTime,
} from "@/lib/time/clinicTime";

function toUtcIso(dateKey: string, time: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return clinicPartsToUtcIso({ year, month, day, hour, minute });
}

/**
 * Creating a block always succeeds, even over existing bookings
 * (M2-CONTRACT.md §3) — there is no dry-run endpoint to preview against, so
 * this submits, then treats the response's `affectedAppointments` as the
 * moment to warn: exactly which visits sit inside the window, stated plainly
 * as still booked, with "Undo" as the way to back out after seeing them.
 */
export function CreateBlockDialog({
  request,
  defaultDateKey,
  onDone,
  onClose,
}: {
  request: AuthorizedRequest;
  defaultDateKey: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(defaultDateKey);
  const [endDate, setEndDate] = useState(defaultDateKey);
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:00");
  const [reason, setReason] = useState("");
  const [repeats, setRepeats] = useState(false);
  const [occurrences, setOccurrences] = useState(4);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<AvailabilityBlockWithWarnings>();
  const [isUndoing, setIsUndoing] = useState(false);
  const [isUndone, setIsUndone] = useState(false);

  async function handleSubmit() {
    setError(undefined);
    const startsAt = toUtcIso(date, startTime);
    const endsAt = toUtcIso(endDate, endTime);
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setError("End must be after start.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAvailabilityBlock(request, {
        startsAt,
        endsAt,
        reason: reason.trim() || undefined,
        recurringRule: repeats ? `FREQ=WEEKLY;COUNT=${occurrences}` : undefined,
      });
      setResult(created);
      onDone();
    } catch {
      setError("That didn't go through. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUndo() {
    if (!result) return;
    setIsUndoing(true);
    try {
      await deleteAvailabilityBlock(request, result.id);
      setIsUndone(true);
      onDone();
    } catch {
      setError("Couldn't undo — the block still stands. Delete it from the calendar instead.");
    } finally {
      setIsUndoing(false);
    }
  }

  if (result) {
    return (
      <Dialog title="Time blocked" onClose={onClose} size="sm">
        <div className="flex flex-col gap-4">
          <InlineAlert tone="success" title="Availability block created">
            {formatClinicDateLabel(result.startsAt)}, {formatClinicTime(result.startsAt)} –{" "}
            {formatClinicTime(result.endsAt)}
            {result.reason ? ` · ${result.reason}` : ""}
          </InlineAlert>

          {result.affectedAppointments.length > 0 ? (
            <InlineAlert tone="warning" title="These appointments fall inside the blocked window">
              <ul className="mt-2 flex flex-col gap-1">
                {result.affectedAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    {formatClinicTime(appointment.startsAt)} — {appointment.patientName}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-medium">
                They remain booked and were not cancelled. Cancel them individually from
                Appointments if the block means they can&rsquo;t go ahead.
              </p>
            </InlineAlert>
          ) : null}

          {error ? <InlineAlert tone="error" title={error} /> : null}
          {isUndone ? <InlineAlert tone="info" title="Block removed." /> : null}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button onClick={onClose} className="sm:flex-1">
              Done
            </Button>
            {!isUndone ? (
              <Button
                variant="quiet"
                disabled={isUndoing}
                onClick={() => void handleUndo()}
                className="sm:flex-1"
              >
                {isUndoing ? "Undoing…" : "Undo — delete this block"}
              </Button>
            ) : null}
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      title="Block time"
      description="Marks time as unavailable for new bookings."
      onClose={onClose}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="block-date">
            <TextInput
              id="block-date"
              type="date"
              min={clinicTodayDateKey()}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                if (endDate < event.target.value) setEndDate(event.target.value);
              }}
            />
          </Field>
          <Field label="End date" htmlFor="block-end-date">
            <TextInput
              id="block-end-date"
              type="date"
              min={date}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </Field>
          <Field label="Start time" htmlFor="block-start-time">
            <TextInput
              id="block-start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </Field>
          <Field label="End time" htmlFor="block-end-time">
            <TextInput
              id="block-end-time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </Field>
        </div>

        <Field label="Reason (optional)" htmlFor="block-reason">
          <Textarea
            id="block-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Personal leave"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={repeats}
            onChange={(event) => setRepeats(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-ink">Repeat weekly</span>
        </label>

        {repeats ? (
          <Field label="Number of weeks" htmlFor="block-occurrences">
            <TextInput
              id="block-occurrences"
              type="number"
              min={1}
              max={52}
              value={occurrences}
              onChange={(event) => setOccurrences(Number(event.target.value) || 1)}
              className="w-24"
            />
          </Field>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button disabled={isSubmitting} onClick={() => void handleSubmit()} className="sm:flex-1">
            {isSubmitting ? "Blocking…" : "Block time"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
