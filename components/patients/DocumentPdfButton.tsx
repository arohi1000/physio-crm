"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import type { SignedFileUrl } from "@/lib/api/admin/receipts";

/**
 * `GET …/pdf` hands back a short-lived signed URL (M3-CONTRACT.md §5), so it
 * is fetched fresh on every click rather than once and cached — a URL held in
 * page state could expire while the doctor is still looking at the record.
 */
export function DocumentPdfButton({
  label,
  fetchUrl,
}: {
  label: string;
  fetchUrl: () => Promise<SignedFileUrl>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleClick() {
    setIsLoading(true);
    setError(undefined);
    try {
      const { url } = await fetchUrl();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Couldn't get the PDF. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="quiet" disabled={isLoading} onClick={() => void handleClick()}>
        {isLoading ? "Preparing…" : label}
      </Button>
      {error ? (
        <p className="text-clay text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
