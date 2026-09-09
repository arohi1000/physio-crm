import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/ApiError";

import { describeSignInFailure } from "./signInFailure";

const noAccessMessage = "This account doesn't have access — contact the doctor.";

describe("describeSignInFailure", () => {
  it("gives the same plain message for a refused account whatever the API said", () => {
    expect(describeSignInFailure(new ApiError("http", "user usr_9 is deactivated", 401))).toBe(
      noAccessMessage,
    );
    expect(describeSignInFailure(new ApiError("http", "forbidden", 403))).toBe(noAccessMessage);
  });

  it("distinguishes an unreachable API from a refusal", () => {
    expect(describeSignInFailure(new ApiError("network", "Could not reach the API."))).toContain(
      "Check your connection",
    );
  });

  it("never leaks a raw error from an unexpected failure", () => {
    expect(describeSignInFailure(new TypeError("googleapis: invalid_client"))).toBe(
      "Something went wrong signing in. Please try again.",
    );
  });
});
