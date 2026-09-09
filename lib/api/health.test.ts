import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

import { apiBaseUrl } from "./config";
import { fetchHealth } from "./health";

const healthPath = "/api/v1/health";

describe("fetchHealth", () => {
  it("returns the payload the mock API serves", async () => {
    await expect(fetchHealth()).resolves.toMatchObject({ status: "ok", version: "mock" });
  });

  it("raises a typed ApiError carrying the status when the API fails", async () => {
    server.use(
      http.get(`${apiBaseUrl}${healthPath}`, () => new HttpResponse(null, { status: 503 })),
    );

    await expect(fetchHealth()).rejects.toMatchObject({ kind: "http", status: 503 });
  });
});
