"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { NewPatientDialog } from "@/components/patients/NewPatientDialog";
import { PatientsTable } from "@/components/patients/PatientsTable";
import { Field, TextInput } from "@/components/ui/Field";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Pagination } from "@/components/ui/Pagination";
import { listPatients } from "@/lib/api/admin/patients";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { useSession } from "@/lib/auth/useSession";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

export default function PatientsPage() {
  const { request } = useSession();
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo(
    () => ({ search: search || undefined, page, limit: PAGE_SIZE }),
    [search, page],
  );

  const { data, error, isLoading } = useApiResource(
    () => listPatients(request, filters),
    [request, filters.search, filters.page],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink text-2xl font-semibold">Patients</h1>
          <p className="text-ink-soft text-sm">Search every patient the clinic has on file.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>Add patient</Button>
      </header>

      <Field label="Search" htmlFor="patients-search" hint="Matches name, phone or email.">
        <TextInput
          id="patients-search"
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPage(1);
          }}
          placeholder="Asha Kumar, +9198765…, a@example.com"
        />
      </Field>

      {error ? (
        <InlineAlert tone="error" title="Couldn't load patients">
          {error.message}
        </InlineAlert>
      ) : null}

      {isLoading ? (
        <p className="text-ink-soft text-sm">Loading patients…</p>
      ) : (
        <>
          <PatientsTable patients={data?.data ?? []} />
          {data ? (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
              itemLabel="patient"
            />
          ) : null}
        </>
      )}

      {isAdding ? (
        <NewPatientDialog
          request={request}
          onCreated={(patientId) => router.push(`/patients/${patientId}`)}
          onClose={() => setIsAdding(false)}
        />
      ) : null}
    </div>
  );
}
