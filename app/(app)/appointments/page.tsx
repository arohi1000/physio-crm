"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { AppointmentDetailDrawer } from "@/components/appointments/AppointmentDetailDrawer";
import {
  AppointmentFilters,
  emptyFilters,
  type AppointmentFiltersValue,
} from "@/components/appointments/AppointmentFilters";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Pagination } from "@/components/ui/Pagination";
import { listAppointments } from "@/lib/api/admin/appointments";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { useSession } from "@/lib/auth/useSession";
import { clinicDayRange } from "@/lib/time/clinicTime";

const PAGE_SIZE = 25;

function AppointmentsPageContent() {
  const { request } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<AppointmentFiltersValue>(emptyFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | undefined>(
    searchParams.get("id") ?? undefined,
  );
  const [isBooking, setIsBooking] = useState(false);

  const apiFilters = useMemo(() => {
    return {
      status: filters.status || undefined,
      serviceId: filters.serviceId || undefined,
      search: filters.search || undefined,
      from: filters.from ? clinicDayRange(filters.from).from : undefined,
      to: filters.to ? clinicDayRange(filters.to).to : undefined,
      page,
      limit: PAGE_SIZE,
    };
  }, [filters, page]);

  const { data, error, isLoading, reload } = useApiResource(
    () => listAppointments(request, apiFilters),
    [
      request,
      apiFilters.status,
      apiFilters.serviceId,
      apiFilters.search,
      apiFilters.from,
      apiFilters.to,
      apiFilters.page,
    ],
  );

  function selectAppointment(id: string | undefined) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("id", id);
    } else {
      params.delete("id");
    }
    router.replace(`/appointments${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink text-2xl font-semibold">Appointments</h1>
          <p className="text-ink-soft text-sm">Search, filter and manage every booking.</p>
        </div>
        <Button onClick={() => setIsBooking(true)}>New booking</Button>
      </header>

      <AppointmentFilters
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {error ? (
        <InlineAlert tone="error" title="Couldn't load appointments">
          {error.message}
        </InlineAlert>
      ) : null}

      {isLoading ? (
        <p className="text-ink-soft text-sm">Loading appointments…</p>
      ) : (
        <>
          <AppointmentsTable appointments={data?.data ?? []} onSelect={selectAppointment} />
          {data ? (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      {selectedId ? (
        <AppointmentDetailDrawer
          request={request}
          appointmentId={selectedId}
          onClose={() => selectAppointment(undefined)}
          onChanged={reload}
        />
      ) : null}

      {isBooking ? (
        <NewAppointmentDialog
          request={request}
          onBooked={() => {
            setIsBooking(false);
            reload();
          }}
          onClose={() => setIsBooking(false)}
        />
      ) : null}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft text-sm">Loading…</p>}>
      <AppointmentsPageContent />
    </Suspense>
  );
}
