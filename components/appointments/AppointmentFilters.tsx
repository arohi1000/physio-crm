"use client";

import { useEffect, useRef, useState } from "react";

import { Field, Select, TextInput } from "@/components/ui/Field";
import { useServices } from "@/lib/hooks/useServices";
import type { AppointmentStatus } from "@/lib/api/admin/appointments";

export type AppointmentFiltersValue = {
  status: AppointmentStatus | "";
  from: string;
  to: string;
  serviceId: string;
  search: string;
};

export const emptyFilters: AppointmentFiltersValue = {
  status: "",
  from: "",
  to: "",
  serviceId: "",
  search: "",
};

const statusOptions: { value: AppointmentStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "booked", label: "Booked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

/**
 * Every filter change re-queries the API — nothing is filtered client-side —
 * so the table, its pagination and the counts it implies all stay honest with
 * what the server actually holds. `search` is debounced so typing a name
 * doesn't fire a request per keystroke.
 */
export function AppointmentFilters({
  value,
  onChange,
}: {
  value: AppointmentFiltersValue;
  onChange: (next: AppointmentFiltersValue) => void;
}) {
  const { data: services } = useServices();
  const [searchDraft, setSearchDraft] = useState(value.search);

  // Derived-state-from-props, done at render time rather than in an effect
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes):
  // resets the draft to match `value.search` — e.g. "Reset filters" — without
  // an extra render.
  const [syncedSearch, setSyncedSearch] = useState(value.search);
  if (value.search !== syncedSearch) {
    setSyncedSearch(value.search);
    setSearchDraft(value.search);
  }

  // Latest `value`/`onChange` read from refs so the debounce timer only
  // resets on `searchDraft` changing, not on every parent re-render.
  const latest = useRef({ value, onChange });
  useEffect(() => {
    latest.current = { value, onChange };
  });

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchDraft !== latest.current.value.search) {
        latest.current.onChange({ ...latest.current.value, search: searchDraft });
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchDraft]);

  return (
    <div className="border-line bg-paper-raised flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-40 flex-1">
        <Field label="Patient search" htmlFor="filter-search">
          <TextInput
            id="filter-search"
            placeholder="Name or phone"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
          />
        </Field>
      </div>

      <div className="w-40">
        <Field label="Status" htmlFor="filter-status">
          <Select
            id="filter-status"
            value={value.status}
            onChange={(event) =>
              onChange({ ...value, status: event.target.value as AppointmentStatus | "" })
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="w-56">
        <Field label="Service" htmlFor="filter-service">
          <Select
            id="filter-service"
            value={value.serviceId}
            onChange={(event) => onChange({ ...value, serviceId: event.target.value })}
          >
            <option value="">All services</option>
            {(services ?? []).map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="w-36">
        <Field label="From" htmlFor="filter-from">
          <TextInput
            id="filter-from"
            type="date"
            value={value.from}
            onChange={(event) => onChange({ ...value, from: event.target.value })}
          />
        </Field>
      </div>

      <div className="w-36">
        <Field label="To" htmlFor="filter-to">
          <TextInput
            id="filter-to"
            type="date"
            value={value.to}
            onChange={(event) => onChange({ ...value, to: event.target.value })}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => onChange(emptyFilters)}
        className="text-sage-deep min-h-11 self-end px-1 text-sm font-medium hover:underline"
      >
        Reset filters
      </button>
    </div>
  );
}
