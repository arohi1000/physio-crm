export type ApiErrorKind = "network" | "timeout" | "http" | "parse";

/**
 * A single error type for every failure the client can produce, so callers can
 * render one error state instead of distinguishing thrown `TypeError`s from
 * non-2xx responses.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}
