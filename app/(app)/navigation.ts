export type NavItem = {
  href: string;
  label: string;
};

export type NavSection = {
  heading: string;
  items: readonly NavItem[];
};

/**
 * Flat and role-blind for now. Milestone 1 filters these sections by role —
 * `doctor_admin` keeps everything, staff loses Coupons, Settings and Activity —
 * and the API guards remain the actual boundary.
 */
export const navSections: readonly NavSection[] = [
  {
    heading: "Daily",
    items: [
      { href: "/", label: "Today" },
      { href: "/calendar", label: "Calendar" },
      { href: "/appointments", label: "Appointments" },
      { href: "/patients", label: "Patients" },
      { href: "/follow-ups", label: "Follow-ups" },
      { href: "/messages", label: "Messages" },
    ],
  },
  {
    heading: "Content",
    items: [
      { href: "/reviews", label: "Reviews" },
      { href: "/content/blog", label: "Blog" },
      { href: "/content/services", label: "Services" },
      { href: "/content/about", label: "About" },
    ],
  },
  {
    heading: "Admin",
    items: [
      { href: "/coupons", label: "Coupons" },
      { href: "/settings/hours", label: "Working hours" },
      { href: "/settings/templates", label: "Message templates" },
      { href: "/settings/users", label: "Users" },
      { href: "/activity", label: "Activity log" },
    ],
  },
];
