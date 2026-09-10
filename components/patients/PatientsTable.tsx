import Link from "next/link";

import type { PatientListItem } from "@/lib/api/admin/patients";
import { formatClinicDateLabel } from "@/lib/time/clinicTime";

function cell(value: string | null): string {
  return value ? formatClinicDateLabel(value) : "—";
}

export function PatientsTable({ patients }: { patients: readonly PatientListItem[] }) {
  if (patients.length === 0) {
    return <p className="text-ink-soft text-sm">No patients match yet.</p>;
  }

  return (
    <div className="border-line overflow-x-auto rounded-md border">
      <table className="w-full text-left text-sm">
        <thead className="border-line text-ink-soft border-b text-xs tracking-widest uppercase">
          <tr>
            <th className="px-3 py-2 font-semibold">Name</th>
            <th className="px-3 py-2 font-semibold">Phone</th>
            <th className="px-3 py-2 font-semibold">Last visit</th>
            <th className="px-3 py-2 font-semibold">Next appointment</th>
            <th className="px-3 py-2 font-semibold">Follow-up due</th>
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-paper">
              <td className="px-3 py-2 font-medium">
                <Link
                  href={`/patients/${patient.id}`}
                  className="text-sage-deep hover:underline focus-visible:underline"
                >
                  {patient.name}
                </Link>
              </td>
              <td className="text-ink-soft px-3 py-2">{patient.phone}</td>
              <td className="text-ink-soft px-3 py-2">{cell(patient.lastVisitAt)}</td>
              <td className="text-ink-soft px-3 py-2">{cell(patient.nextAppointmentAt)}</td>
              <td className="text-ink-soft px-3 py-2">{cell(patient.followUpDueAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
