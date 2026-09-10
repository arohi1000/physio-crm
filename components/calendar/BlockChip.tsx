import { eventLayout } from "@/components/calendar/gridLayout";
import type { AvailabilityBlock } from "@/lib/api/admin/availabilityBlocks";
import { formatClinicTime } from "@/lib/time/clinicTime";

/**
 * Blocked time. A diagonal-hatch fill (not just a flat colour) so it reads as
 * "unavailable" rather than "booked" even to a colour-blind viewer — booked
 * appointments are solid fills (`AppointmentChip`).
 */
export function BlockChip({
  block,
  onSelect,
}: {
  block: AvailabilityBlock;
  onSelect: (block: AvailabilityBlock) => void;
}) {
  const { topRem, heightRem } = eventLayout(block.startsAt, block.endsAt);

  return (
    <button
      type="button"
      onClick={() => onSelect(block)}
      style={{
        top: `${topRem}rem`,
        height: `${heightRem}rem`,
        backgroundImage:
          "repeating-linear-gradient(45deg, var(--clay) 0, var(--clay) 2px, transparent 2px, transparent 8px)",
      }}
      className="border-clay text-clay bg-paper absolute inset-x-0.5 overflow-hidden rounded border px-1.5 py-0.5 text-left text-xs leading-tight opacity-90"
      title={block.reason ?? "Blocked"}
    >
      <span className="bg-paper-raised/80 block rounded-sm px-0.5 font-semibold">
        {formatClinicTime(block.startsAt)} blocked
      </span>
    </button>
  );
}
