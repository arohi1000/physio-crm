"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/ui/Dialog";
import { InlineAlert } from "@/components/ui/InlineAlert";
import {
  deleteAvailabilityBlock,
  type AvailabilityBlock,
} from "@/lib/api/admin/availabilityBlocks";
import type { AuthorizedRequest } from "@/lib/auth/authorizedRequester";
import { formatClinicDateLabel, formatClinicTime } from "@/lib/time/clinicTime";

export function BlockDetailsDialog({
  request,
  block,
  onDeleted,
  onClose,
}: {
  request: AuthorizedRequest;
  block: AvailabilityBlock;
  onDeleted: () => void;
  onClose: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleDelete() {
    setIsDeleting(true);
    setError(undefined);
    try {
      await deleteAvailabilityBlock(request, block.id);
      onDeleted();
    } catch {
      setError("That didn't go through. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <Dialog title="Blocked time" onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        {error ? <InlineAlert tone="error" title={error} /> : null}
        <div className="text-sm">
          <p className="text-ink font-medium">{formatClinicDateLabel(block.startsAt)}</p>
          <p className="text-ink-soft">
            {formatClinicTime(block.startsAt)} – {formatClinicTime(block.endsAt)}
          </p>
          {block.reason ? <p className="text-ink mt-2">{block.reason}</p> : null}
          {block.recurringRule ? (
            <p className="text-ink-soft mt-2 text-xs">Repeats: {block.recurringRule}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            className="bg-clay hover:bg-clay sm:flex-1"
          >
            {isDeleting ? "Removing…" : "Remove this block"}
          </Button>
          <Button variant="quiet" disabled={isDeleting} onClick={onClose} className="sm:flex-1">
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
