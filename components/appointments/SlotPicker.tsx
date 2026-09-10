"use client";

import { Field, TextInput } from "@/components/ui/Field";
import { getAvailability, type Slot } from "@/lib/api/public/availability";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { formatClinicTime } from "@/lib/time/clinicTime";

/**
 * Reuses the same public `GET /availability` the guest booking wizard calls
 * (M2-CONTRACT.md §2), so a walk-in or a reschedule is held to exactly the
 * slot rules a public booking would be. An empty `slots` array is a valid
 * response — a fully booked or non-working day, not an error.
 */
export function SlotPicker({
  serviceId,
  date,
  onDateChange,
  selectedSlot,
  onSelectSlot,
  minDate,
}: {
  serviceId: string;
  date: string;
  onDateChange: (date: string) => void;
  selectedSlot: Slot | undefined;
  onSelectSlot: (slot: Slot) => void;
  minDate?: string;
}) {
  const { data, error, isLoading } = useApiResource(
    () => getAvailability(serviceId, date),
    [serviceId, date],
  );

  return (
    <div className="flex flex-col gap-3">
      <Field label="Date" htmlFor="slot-date">
        <TextInput
          id="slot-date"
          type="date"
          min={minDate}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </Field>

      {isLoading ? (
        <p className="text-ink-soft text-sm">Loading available times…</p>
      ) : error ? (
        <p className="text-clay text-sm">Couldn&rsquo;t load availability. Try another date.</p>
      ) : (data?.slots.length ?? 0) === 0 ? (
        <p className="border-line bg-paper text-ink-soft rounded-md border p-3 text-sm">
          No bookable times on this date — fully booked, blocked, or outside working hours.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Available times">
          {data?.slots.map((slot) => {
            const isSelected = selectedSlot?.startsAt === slot.startsAt;
            return (
              <button
                key={slot.startsAt}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectSlot(slot)}
                className={`min-h-11 rounded-md border px-3 text-sm font-medium ${
                  isSelected
                    ? "border-sage-deep bg-sage-deep text-paper-raised"
                    : "border-line text-ink hover:bg-paper"
                }`}
              >
                {formatClinicTime(slot.startsAt)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
