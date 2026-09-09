"use client";

import { apiBaseUrl, isApiMockingEnabled } from "@/lib/api/config";
import { useHealthCheck } from "./useHealthCheck";

/**
 * THROWAWAY SCAFFOLDING (Milestone 0).
 *
 * Its only job is to prove the browser can reach `physio-api` through real CORS
 * and that a failed call renders instead of crashing the page. It is not a
 * product surface, it is not linked from the app shell, and it is deleted once
 * a real authenticated screen exercises the same path.
 */
export default function DevHealthPage() {
  const { state, retry } = useHealthCheck();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-col gap-2">
        <p className="text-clay text-xs font-semibold tracking-widest uppercase">
          Throwaway scaffolding &middot; delete after Milestone 1
        </p>
        <h1 className="text-ink text-2xl font-semibold">API health check</h1>
        <p className="text-ink-soft text-sm">
          Calls <code className="font-mono">GET /api/v1/health</code> on{" "}
          <code className="font-mono">{apiBaseUrl}</code>
          {isApiMockingEnabled ? " (intercepted by MSW)." : "."}
        </p>
      </header>

      {state.status === "loading" ? (
        <p
          aria-live="polite"
          className="border-line bg-paper-raised text-ink-soft rounded-lg border p-5 text-sm"
        >
          Contacting the API&hellip;
        </p>
      ) : null}

      {state.status === "ok" ? (
        <section aria-live="polite" className="border-line bg-paper-raised rounded-lg border p-5">
          <h2 className="text-sage-deep text-sm font-semibold">API reachable</h2>
          <pre className="bg-paper text-ink mt-3 overflow-x-auto rounded-md p-3 font-mono text-xs">
            {JSON.stringify(state.payload, null, 2)}
          </pre>
        </section>
      ) : null}

      {state.status === "error" ? (
        <section aria-live="polite" className="border-clay bg-paper-raised rounded-lg border p-5">
          <h2 className="text-clay text-sm font-semibold">API unreachable</h2>
          <p className="text-ink-soft mt-2 text-sm">{state.message}</p>
          <p className="text-ink-soft mt-2 text-sm">
            Start <code className="font-mono">physio-api</code> on port 4000, or run this app with{" "}
            <code className="font-mono">NEXT_PUBLIC_API_MOCKING=enabled</code> to work against MSW.
          </p>
        </section>
      ) : null}

      <button
        type="button"
        onClick={retry}
        disabled={state.status === "loading"}
        className="border-line bg-paper-raised text-ink hover:border-sage min-h-11 self-start rounded-md border px-4 text-sm font-semibold disabled:opacity-50"
      >
        Check again
      </button>
    </main>
  );
}
