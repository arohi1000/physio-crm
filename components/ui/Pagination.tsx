export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-ink-soft text-xs">
        Page {page} of {totalPages} &middot; {total} appointment{total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border-line text-ink hover:bg-paper min-h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="border-line text-ink hover:bg-paper min-h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}
