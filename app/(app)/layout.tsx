import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

/**
 * Every route in this group requires a session and role-filtered navigation.
 * Both live in `AppShell`, which needs the session context and therefore the
 * client; this layout stays a server component so nothing else has to.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
