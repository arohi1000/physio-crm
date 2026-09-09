"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { isRouteVisibleToRole, navSectionsForRole } from "@/app/(app)/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { LoadingScreen } from "@/components/LoadingScreen";
import { dashboardPath, loginPath } from "@/lib/auth/safeRedirectPath";
import type { AuthRole } from "@/lib/auth/types";
import { useSession } from "@/lib/auth/useSession";

const roleLabels: Record<AuthRole, string> = {
  doctor_admin: "Doctor (admin)",
  staff: "Staff",
};

/**
 * The signed-in chrome, and the gate in front of it. Nothing under `(app)`
 * renders without a session; an anonymous visitor is sent to `/login` carrying
 * where they were trying to go, so signing in lands them there and not on a
 * dashboard they have to navigate away from.
 *
 * A staff account that reaches a doctor-only URL is sent to the dashboard for
 * the same reason its link is hidden: it is a dead end for that account. That
 * is a courtesy, not a control — the API's guards decide what the data does.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isRouteAllowed =
    state.status !== "authenticated" || isRouteVisibleToRole(pathname, state.user.role);

  useEffect(() => {
    if (state.status === "anonymous") {
      router.replace(`${loginPath}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isRouteAllowed) {
      router.replace(dashboardPath);
    }
  }, [state.status, isRouteAllowed, pathname, router]);

  if (state.status !== "authenticated") {
    return (
      <LoadingScreen
        message={
          state.status === "restoring" ? "Restoring your session…" : "Redirecting to sign in…"
        }
      />
    );
  }

  if (!isRouteAllowed) {
    return <LoadingScreen message="That page is for the doctor's account. Taking you back…" />;
  }

  const { user } = state;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <header className="border-line bg-paper-raised flex flex-col border-b lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="border-line flex min-h-16 items-center justify-between gap-3 px-4 lg:border-b">
          <span className="text-ink shrink-0 text-base font-semibold">Physio CRM</span>
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <span className="text-ink-soft truncate text-xs">
              {user.name} &middot; {roleLabels[user.role]}
            </span>
            <SignOutButton />
          </div>
        </div>

        <AppSidebar sections={navSectionsForRole(user.role)} />

        <div className="border-line hidden flex-col gap-3 border-t p-4 lg:flex">
          <div className="flex flex-col">
            <span className="text-ink truncate text-sm font-semibold">{user.name}</span>
            <span className="text-ink-soft text-xs">{roleLabels[user.role]}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
