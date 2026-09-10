export type ApiErrorKind = "network" | "timeout" | "http" | "parse";

/**
 * A single error type for every failure the client can produce, so callers can
 * render one error state instead of distinguishing thrown `TypeError`s from
 * non-2xx responses.
 *
 * `code` is the API's stable machine-readable error code (M2-CONTRACT.md §1),
 * e.g. `SLOT_UNAVAILABLE`. Callers must branch on this, never on `message` —
 * message text is for humans and will change.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;

  constructor(kind: ApiErrorKind, message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}
