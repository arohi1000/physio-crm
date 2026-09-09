import type { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { navSections } from "./navigation";

/**
 * The signed-in shell. Milestone 1 makes this route group require a session and
 * filters the navigation by role; today it renders for anyone.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <header className="border-line bg-paper-raised border-b lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="border-line flex min-h-16 items-center gap-3 px-4 lg:border-b">
          <span className="text-ink text-base font-semibold">Physio CRM</span>
          <span className="border-line text-ink-soft rounded-full border px-2 py-0.5 text-xs">
            Milestone 0
          </span>
        </div>
        <AppSidebar sections={navSections} />
      </header>

      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
