import { describe, expect, it } from "vitest";

import type { AuthRole } from "@/lib/auth/types";

import { isRouteVisibleToRole, navSectionsForRole } from "./navigation";

function labelsFor(role: AuthRole): string[] {
  return navSectionsForRole(role).flatMap((section) => section.items.map((item) => item.label));
}

const sharedLabels = [
  "Today",
  "Calendar",
  "Appointments",
  "Patients",
  "Follow-ups",
  "Messages",
  "Reviews",
  "Blog",
  "Services",
  "About",
];

const adminOnlyLabels = ["Coupons", "Working hours", "Message templates", "Users", "Activity log"];

describe("navSectionsForRole", () => {
  it("gives staff the daily and content sections only", () => {
    expect(labelsFor("staff")).toEqual(sharedLabels);
  });

  it("adds the admin section for doctor_admin", () => {
    expect(labelsFor("doctor_admin")).toEqual([...sharedLabels, ...adminOnlyLabels]);
  });

  it("answers the same way for a URL typed straight into the bar", () => {
    expect(isRouteVisibleToRole("/coupons", "staff")).toBe(false);
    expect(isRouteVisibleToRole("/settings/users", "staff")).toBe(false);
    expect(isRouteVisibleToRole("/activity", "staff")).toBe(false);

    expect(isRouteVisibleToRole("/coupons", "doctor_admin")).toBe(true);
    expect(isRouteVisibleToRole("/patients", "staff")).toBe(true);
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
