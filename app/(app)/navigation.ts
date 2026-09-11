import { dashboardPath } from "@/lib/auth/safeRedirectPath";
import type { AuthRole } from "@/lib/auth/types";

export type NavItem = {
  readonly href: string;
  readonly label: string;
};

export type NavSection = {
  readonly heading: string;
  readonly visibleTo: readonly AuthRole[];
  readonly items: readonly NavItem[];
};

const everyone: readonly AuthRole[] = ["doctor_admin", "staff"];
const doctorOnly: readonly AuthRole[] = ["doctor_admin"];

/*
 * Scope trimmed 2026-09-12 (see ../../../Clinic_Demo/PRD.md §6). Entries for
 * Reviews, Coupons and Users are commented out rather than removed so that
 * reconnecting them in Phase 2 is uncommenting one line each — the pages,
 * their components and the API behind them are all still in the repo.
 *
 * This is the one place commented-out code is deliberate rather than sloppy.
 *
 * The role-gating machinery below stays even though Phase 1 has a single
 * doctor_admin account. It is what makes adding staff later a configuration
 * change instead of a rebuild, and it costs nothing to keep.
 */

const navSections: readonly NavSection[] = [
  {
    heading: "Daily",
    visibleTo: everyone,
    items: [
      { href: dashboardPath, label: "Today" },
      { href: "/calendar", label: "Calendar" },
      { href: "/appointments", label: "Appointments" },
      { href: "/patients", label: "Patients" },
      { href: "/follow-ups", label: "Follow-ups" },
      { href: "/messages", label: "Messages" },
    ],
  },
  {
    heading: "Content",
    visibleTo: everyone,
    items: [
      // Deferred to Phase 2: { href: "/reviews", label: "Reviews" }
      // Social proof becomes static content on the public site for Phase 1 —
      // a CRUD module to manage a handful of testimonials is poor value.
      { href: "/content/blog", label: "Blog" },
      { href: "/content/services", label: "Services" },
      { href: "/content/about", label: "About" },
    ],
  },
  {
    heading: "Admin",
    visibleTo: doctorOnly,
    items: [
      // Deferred to Phase 2: { href: "/coupons", label: "Coupons" }
      { href: "/settings/hours", label: "Working hours" },
      { href: "/settings/templates", label: "Message templates" },
      // Deferred to Phase 2: { href: "/settings/users", label: "Users" }
      // Phase 1 has a single doctor_admin account, so there is nobody to manage.
      { href: "/activity", label: "Activity log" },
    ],
  },
];

/**
 * Hiding a link a role cannot use is a courtesy, not a control: the API's guards
 * are the actual boundary, and a staff account that types `/coupons` still gets
 * a 403 from the endpoints that page calls.
 */
export function navSectionsForRole(role: AuthRole): readonly NavSection[] {
  return navSections.filter((section) => section.visibleTo.includes(role));
}

/**
 * Pages whose feature is deferred to Phase 2. Removing them from `navSections`
 * hides the links, but a path no section claims is otherwise *allowed* — so
 * without this list, typing `/coupons` would still render a page whose every
 * API call now 404s. Listed explicitly so the route is closed for the same
 * reason the link is gone, and reopens by deleting one entry.
 */
const deferredRoutes: readonly string[] = ["/coupons", "/reviews", "/settings/users"];

/**
 * Answers the same question for a URL somebody typed or bookmarked, from the
 * same table, so a hidden link and a blocked route can never disagree. A path
 * no section claims — a patient record, say — is allowed here and decided by
 * the API, which is where the decision actually counts.
 */
export function isRouteVisibleToRole(pathname: string, role: AuthRole): boolean {
  if (deferredRoutes.some((route) => pathname.startsWith(route))) {
    return false;
  }

  const owningSection = navSections.find((section) =>
    section.items.some((item) => item.href !== dashboardPath && pathname.startsWith(item.href)),
  );

  return owningSection === undefined || owningSection.visibleTo.includes(role);
}
