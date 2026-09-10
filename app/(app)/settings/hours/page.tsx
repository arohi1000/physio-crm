"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { TextInput } from "@/components/ui/Field";
import {
  getClinicSettings,
  updateClinicSettings,
  type WeeklyWorkingHours,
  type WorkingInterval,
} from "@/lib/api/admin/clinicSettings";
import { ApiError } from "@/lib/api/ApiError";
import { useSession } from "@/lib/auth/useSession";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/time/clinicTime";

const weekdayLabel: Record<WeekdayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function cloneWorkingHours(hours: WeeklyWorkingHours): WeeklyWorkingHours {
  return {
    mon: [...hours.mon],
    tue: [...hours.tue],
    wed: [...hours.wed],
    thu: [...hours.thu],
    fri: [...hours.fri],
    sat: [...hours.sat],
    sun: [...hours.sun],
  };
}

/**
 * The template the slot engine computes availability from
 * (M2-CONTRACT.md §3): `HH:mm` local intervals per weekday, `[]` meaning
 * closed. `doctor_admin` only — the API 403s a staff token, and the nav
 * already hides this route for staff (M1's `navigation.ts`); reaching it by
 * URL is blocked by `AppShell`, not by anything on this page.
 */
export default function WorkingHoursSettingsPage() {
  const { request } = useSession();
  const { data, error, isLoading } = useApiResource(() => getClinicSettings(request), [request]);

  const [draft, setDraft] = useState<WeeklyWorkingHours>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Derived-state-from-props at render time, not in an effect
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes):
  // seeds the editable draft the first time settings load.
  const [syncedData, setSyncedData] = useState<WeeklyWorkingHours>();
  if (data && data.workingHours !== syncedData) {
    setSyncedData(data.workingHours);
    setDraft(cloneWorkingHours(data.workingHours));
  }

  function updateInterval(
    day: WeekdayKey,
    index: number,
    field: keyof WorkingInterval,
    value: string,
  ) {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneWorkingHours(current);
      next[day][index] = { ...next[day][index], [field]: value };
      return next;
    });
    setSaveSuccess(false);
  }

  function addInterval(day: WeekdayKey) {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneWorkingHours(current);
      next[day].push({ start: "09:00", end: "13:00" });
      return next;
    });
    setSaveSuccess(false);
  }

  function removeInterval(day: WeekdayKey, index: number) {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneWorkingHours(current);
      next[day].splice(index, 1);
      return next;
    });
    setSaveSuccess(false);
  }

  async function handleSave() {
    if (!draft) return;
    setIsSaving(true);
    setSaveError(undefined);
    setSaveSuccess(false);
    try {
      await updateClinicSettings(request, { workingHours: draft });
      setSaveSuccess(true);
    } catch (cause) {
      setSaveError(
        cause instanceof ApiError && cause.status === 403
          ? "Only the doctor's account can change working hours."
          : "That didn't save. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-ink text-2xl font-semibold">Working hours</h1>
        <p className="text-ink-soft text-sm">
          The weekly template the slot engine computes availability from. Times are local to{" "}
          {data?.timezone ?? "the clinic"}. An empty day means closed.
        </p>
      </header>

      {error ? (
        <InlineAlert tone="error" title="Couldn't load working hours">
          {error.status === 403
            ? "Only the doctor's account can view or change working hours."
            : error.message}
        </InlineAlert>
      ) : isLoading || !draft ? (
        <p className="text-ink-soft text-sm">Loading…</p>
      ) : (
        <>
          {saveError ? <InlineAlert tone="error" title={saveError} /> : null}
          {saveSuccess ? (
            <InlineAlert tone="success" title="Working hours saved">
              The updated template applies to availability immediately.
            </InlineAlert>
          ) : null}

          <div className="flex flex-col gap-3">
            {WEEKDAY_KEYS.map((day) => (
              <div key={day} className="border-line bg-paper-raised rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-ink text-sm font-semibold">{weekdayLabel[day]}</h2>
                  <button
                    type="button"
                    onClick={() => addInterval(day)}
                    className="text-sage-deep text-xs font-semibold hover:underline"
                  >
                    + Add interval
                  </button>
                </div>

                {draft[day].length === 0 ? (
                  <p className="text-ink-soft mt-2 text-sm">Closed</p>
                ) : (
                  <div className="mt-2 flex flex-col gap-2">
                    {draft[day].map((interval, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TextInput
                          type="time"
                          value={interval.start}
                          onChange={(event) =>
                            updateInterval(day, index, "start", event.target.value)
                          }
                          aria-label={`${weekdayLabel[day]} interval ${index + 1} start`}
                          className="w-32"
                        />
                        <span className="text-ink-soft text-sm">to</span>
                        <TextInput
                          type="time"
                          value={interval.end}
                          onChange={(event) =>
                            updateInterval(day, index, "end", event.target.value)
                          }
                          aria-label={`${weekdayLabel[day]} interval ${index + 1} end`}
                          className="w-32"
                        />
                        <button
                          type="button"
                          onClick={() => removeInterval(day, index)}
                          aria-label={`Remove ${weekdayLabel[day]} interval ${index + 1}`}
                          className="text-clay hover:bg-paper flex min-h-9 min-w-9 items-center justify-center rounded-md text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button disabled={isSaving} onClick={() => void handleSave()}>
              {isSaving ? "Saving…" : "Save working hours"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
