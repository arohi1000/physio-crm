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
      { href: "/reviews", label: "Reviews" },
      { href: "/content/blog", label: "Blog" },
      { href: "/content/services", label: "Services" },
      { href: "/content/about", label: "About" },
    ],
  },
  {
    heading: "Admin",
    visibleTo: doctorOnly,
    items: [
      { href: "/coupons", label: "Coupons" },
      { href: "/settings/hours", label: "Working hours" },
      { href: "/settings/templates", label: "Message templates" },
      { href: "/settings/users", label: "Users" },
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
 * Answers the same question for a URL somebody typed or bookmarked, from the
 * same table, so a hidden link and a blocked route can never disagree. A path
 * no section claims — a patient record, say — is allowed here and decided by
 * the API, which is where the decision actually counts.
 */
export function isRouteVisibleToRole(pathname: string, role: AuthRole): boolean {
  const owningSection = navSections.find((section) =>
    section.items.some((item) => item.href !== dashboardPath && pathname.startsWith(item.href)),
  );

  return owningSection === undefined || owningSection.visibleTo.includes(role);
}
