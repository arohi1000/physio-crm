import { describe, expect, it } from "vitest";

import type { AuthRole } from "@/lib/auth/types";

import { isRouteVisibleToRole, navSectionsForRole } from "./navigation";

function labelsFor(role: AuthRole): string[] {
  return navSectionsForRole(role).flatMap((section) => section.items.map((item) => item.label));
}

// Scope trimmed 2026-09-12: Reviews, Coupons and Users left the navigation when
// their features were deferred to Phase 2. Asserting the exact list is the point
// — it fails loudly if a deferred item is reconnected without a decision.
const sharedLabels = [
  "Today",
  "Calendar",
  "Appointments",
  "Patients",
  "Follow-ups",
  "Messages",
  "Blog",
  "Services",
  "About",
];

const adminOnlyLabels = ["Working hours", "Message templates", "Activity log"];

describe("navSectionsForRole", () => {
  it("gives staff the daily and content sections only", () => {
    expect(labelsFor("staff")).toEqual(sharedLabels);
  });

  it("adds the admin section for doctor_admin", () => {
    expect(labelsFor("doctor_admin")).toEqual([...sharedLabels, ...adminOnlyLabels]);
  });

  it("answers the same way for a URL typed straight into the bar", () => {
    expect(isRouteVisibleToRole("/activity", "staff")).toBe(false);
    expect(isRouteVisibleToRole("/activity", "doctor_admin")).toBe(true);
    expect(isRouteVisibleToRole("/patients", "staff")).toBe(true);
  });

  it("closes a deferred route to every role, not just the one that lost the link", () => {
    // Scope trimmed 2026-09-12. These pages are still in the repo for Phase 2,
    // but every endpoint they call now 404s — so reaching them by typing the
    // URL would render a broken page rather than a forbidden one.
    for (const route of ["/coupons", "/reviews", "/settings/users"]) {
      expect(isRouteVisibleToRole(route, "doctor_admin")).toBe(false);
      expect(isRouteVisibleToRole(route, "staff")).toBe(false);
    }
  });

  it("leaves a route no section claims to the API to decide", () => {
    expect(isRouteVisibleToRole("/", "staff")).toBe(true);
    expect(isRouteVisibleToRole("/patients/pat_42", "staff")).toBe(true);
  });

  it("hides every admin destination from staff", () => {
    const staffLabels = labelsFor("staff");

    for (const label of adminOnlyLabels) {
      expect(staffLabels).not.toContain(label);
    }
  });
});
