import { describe, expect, it } from "vitest";

import { dashboardPath, safeRedirectPath } from "./safeRedirectPath";

describe("safeRedirectPath", () => {
  it("keeps an in-app destination so sign-in returns where the user was headed", () => {
    expect(safeRedirectPath("/patients/42")).toBe("/patients/42");
    expect(safeRedirectPath("/appointments?status=cancelled")).toBe(
      "/appointments?status=cancelled",
    );
  });

  it("falls back to the dashboard when there is no destination", () => {
    expect(safeRedirectPath(null)).toBe(dashboardPath);
    expect(safeRedirectPath("")).toBe(dashboardPath);
  });

  it("refuses destinations that leave the app", () => {
    expect(safeRedirectPath("https://evil.example.com")).toBe(dashboardPath);
    expect(safeRedirectPath("//evil.example.com")).toBe(dashboardPath);
    expect(safeRedirectPath("/\\evil.example.com")).toBe(dashboardPath);
  });

  it("refuses to bounce back to the login page", () => {
    expect(safeRedirectPath("/login")).toBe(dashboardPath);
    expect(safeRedirectPath("/login?next=/login")).toBe(dashboardPath);
  });
});
