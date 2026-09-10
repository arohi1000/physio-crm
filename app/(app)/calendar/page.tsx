"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { AppointmentDetailDrawer } from "@/components/appointments/AppointmentDetailDrawer";
import { BlockDetailsDialog } from "@/components/calendar/BlockDetailsDialog";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { CreateBlockDialog } from "@/components/calendar/CreateBlockDialog";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { TimeGrid } from "@/components/calendar/TimeGrid";
import type { CalendarView } from "@/components/calendar/types";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { listAllAppointmentsInRange } from "@/lib/api/admin/appointments";
import { listAvailabilityBlocks, type AvailabilityBlock } from "@/lib/api/admin/availabilityBlocks";
import { useSession } from "@/lib/auth/useSession";
import { useApiResource } from "@/lib/hooks/useApiResource";
import {
  clinicDayRange,
  clinicTodayDateKey,
  monthGridDateKeys,
  weekDateKeys,
} from "@/lib/time/clinicTime";

function rangeForView(
  view: CalendarView,
  dateKey: string,
): { from: string; to: string; gridDateKeys: readonly string[] } {
  if (view === "day") {
    const range = clinicDayRange(dateKey);
    return { ...range, gridDateKeys: [dateKey] };
  }
  if (view === "week") {
    const days = weekDateKeys(dateKey);
    return {
      from: clinicDayRange(days[0]).from,
      to: clinicDayRange(days[6]).to,
      gridDateKeys: days,
    };
  }
  const days = monthGridDateKeys(dateKey);
  return {
    from: clinicDayRange(days[0]).from,
    to: clinicDayRange(days[days.length - 1]).to,
    gridDateKeys: days,
  };
}

function CalendarPageContent() {
  const { request } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<CalendarView>(
    (searchParams.get("view") as CalendarView) || "week",
  );
  const [dateKey, setDateKey] = useState(searchParams.get("date") || clinicTodayDateKey());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>();
  const [selectedBlock, setSelectedBlock] = useState<AvailabilityBlock>();
  const [isCreatingBlock, setIsCreatingBlock] = useState(false);

  function updateUrl(nextView: CalendarView, nextDateKey: string) {
    router.replace(`/calendar?view=${nextView}&date=${nextDateKey}`, { scroll: false });
  }

  function handleViewChange(nextView: CalendarView) {
    setView(nextView);
    updateUrl(nextView, dateKey);
  }

  function handleDateChange(nextDateKey: string) {
    setDateKey(nextDateKey);
    updateUrl(view, nextDateKey);
  }

  const { from, to, gridDateKeys } = useMemo(() => rangeForView(view, dateKey), [view, dateKey]);

  const {
    data: appointments,
    error: appointmentsError,
    isLoading: isLoadingAppointments,
    reload: reloadAppointments,
  } = useApiResource(() => listAllAppointmentsInRange(request, { from, to }), [request, from, to]);

  const {
    data: blocks,
    error: blocksError,
    isLoading: isLoadingBlocks,
    reload: reloadBlocks,
  } = useApiResource(() => listAvailabilityBlocks(request, from, to), [request, from, to]);

  function reloadAll() {
    reloadAppointments();
    reloadBlocks();
  }

  const isLoading = isLoadingAppointments || isLoadingBlocks;
  const error = appointmentsError ?? blocksError;

  return (
    <div className="flex flex-col gap-6">
      <CalendarToolbar
        view={view}
        dateKey={dateKey}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        onCreateBlock={() => setIsCreatingBlock(true)}
      />

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-sage-deep border-sage-deep inline-block h-3 w-3 rounded border" />
          <span className="text-ink-soft">Booked appointment</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="border-clay inline-block h-3 w-3 rounded border"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--clay) 0, var(--clay) 1.5px, transparent 1.5px, transparent 5px)",
            }}
          />
          <span className="text-ink-soft">Blocked time</span>
        </span>
      </div>

      {error ? (
        <InlineAlert tone="error" title="Couldn't load the calendar">
          {error.message}
        </InlineAlert>
      ) : null}

      {isLoading ? (
        <p className="text-ink-soft text-sm">Loading…</p>
      ) : view === "month" ? (
        <MonthGrid
          monthDateKey={dateKey}
          gridDateKeys={gridDateKeys}
          appointments={appointments ?? []}
          blocks={blocks ?? []}
          todayKey={clinicTodayDateKey()}
          onSelectDay={(day) => {
            setDateKey(day);
            setView("day");
            updateUrl("day", day);
          }}
        />
      ) : (
        <TimeGrid
          dateKeys={gridDateKeys}
          appointments={appointments ?? []}
          blocks={blocks ?? []}
          onSelectAppointment={setSelectedAppointmentId}
          onSelectBlock={setSelectedBlock}
        />
      )}

      {selectedAppointmentId ? (
        <AppointmentDetailDrawer
          request={request}
          appointmentId={selectedAppointmentId}
          onClose={() => setSelectedAppointmentId(undefined)}
          onChanged={reloadAll}
        />
      ) : null}

      {selectedBlock ? (
        <BlockDetailsDialog
          request={request}
          block={selectedBlock}
          onDeleted={() => {
            setSelectedBlock(undefined);
            reloadAll();
          }}
          onClose={() => setSelectedBlock(undefined)}
        />
      ) : null}

      {isCreatingBlock ? (
        <CreateBlockDialog
          request={request}
          defaultDateKey={view === "month" ? clinicTodayDateKey() : dateKey}
          onDone={reloadAll}
          onClose={() => setIsCreatingBlock(false)}
        />
      ) : null}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft text-sm">Loading…</p>}>
      <CalendarPageContent />
    </Suspense>
  );
}
