import { Suspense } from "react";

import { SignInPanel } from "@/components/auth/SignInPanel";
import { LoadingScreen } from "@/components/LoadingScreen";

/**
 * Deliberately outside the `(app)` route group: the shell assumes a session and
 * this page is what you see without one.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      {/* `SignInPanel` reads `?next=`, which Next requires a suspense boundary for. */}
      <Suspense fallback={<LoadingScreen message="Loading sign in…" />}>
        <SignInPanel />
      </Suspense>
    </main>
  );
}
