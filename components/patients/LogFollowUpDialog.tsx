"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, TextInput, Textarea } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { ApiError } from "@/lib/api/ApiError";
import { getClinicSettings } from "@/lib/api/admin/clinicSettings";
import { createFollowUp, type FollowUp } from "@/lib/api/admin/followUps";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import {
  addDaysToDateKey,
  clinicTodayDateKey,
  formatClinicDateLabel,
  formatDateKeyLabel,
} from "@/lib/time/clinicTime";

/**
 * Logging a follow-up only ever computes and stores `reminderScheduledFor` —
 * nothing is enqueued until the M4 worker exists (M3-CONTRACT.md §1, §7.4).
 * The confirmation step below exists so the doctor sees that computed time,
 * plainly labelled as unsent, before they walk away from the dialog.
 */
export function LogFollowUpDialog({
  request,
  patientId,
  onSaved,
  onClose,
}: {
  request: AuthorizedRequest;
  patientId: string;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [purpose, setPurpose] = useState("");
  const [revisitTargetDate, setRevisitTargetDate] = useState(clinicTodayDateKey());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<FollowUp>();
  const [reminderLeadDays, setReminderLeadDays] = useState<number>();

  // The doctor should know when the reminder fires before committing to it, not
  // after. The server stays authoritative — this only previews the same
  // subtraction it will perform.
  useEffect(() => {
    let isMounted = true;
    getClinicSettings(request)
      .then((settings) => {
        if (isMounted) {
          setReminderLeadDays(settings.followUpReminderLeadDays);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, [request]);

  const previewedReminderDateKey =
    reminderLeadDays !== undefined && revisitTargetDate !== ""
      ? addDaysToDateKey(revisitTargetDate, -reminderLeadDays)
      : undefined;

  const canSubmit = purpose.trim() !== "" && revisitTargetDate !== "";

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      const followUp = await createFollowUp(request, patientId, {
        purpose: purpose.trim(),
        revisitTargetDate,
      });
      setSaved(followUp);
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "FOLLOW_UP_DATE_IN_PAST") {
        setError("Revisit target date can't be in the past.");
      } else {
        setError("That didn't go through. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  if (saved) {
    return (
      <Dialog title="Follow-up logged" onClose={onSaved} size="sm">
        <div className="flex flex-col gap-4">
          <InlineAlert tone="success" title="Reminder scheduled for">
            {formatClinicDateLabel(saved.reminderScheduledFor)}
          </InlineAlert>
          <p className="text-ink-soft text-sm">
            Nothing is sent yet — this milestone only records when a reminder would send. No message
            goes out until that part of the system exists.
          </p>
          <Button onClick={onSaved} className="sm:flex-1">
            Done
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title="Log a follow-up" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}

        <Field label="Purpose" htmlFor="follow-up-purpose">
          <Textarea
            id="follow-up-purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="Review shoulder mobility"
            required
          />
        </Field>

        <Field label="Revisit target date" htmlFor="follow-up-date">
          <TextInput
            id="follow-up-date"
            type="date"
            min={clinicTodayDateKey()}
            value={revisitTargetDate}
            onChange={(event) => setRevisitTargetDate(event.target.value)}
            required
          />
        </Field>

        {previewedReminderDateKey ? (
          <p className="text-ink-soft text-sm">
            A reminder would be scheduled for{" "}
            <span className="text-ink font-medium">
              {formatDateKeyLabel(previewedReminderDateKey)}
            </span>
            , {reminderLeadDays} day{reminderLeadDays === 1 ? "" : "s"} before the revisit. Nothing
            is sent yet.
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
            className="sm:flex-1"
          >
            {isSubmitting ? "Saving…" : "Save follow-up"}
          </Button>
          <Button variant="quiet" disabled={isSubmitting} onClick={onClose} className="sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
