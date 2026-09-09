"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isApiMockingEnabled } from "@/lib/api/config";

/**
 * Held at module scope because React Strict Mode runs effects twice in
 * development, and MSW throws if `start()` is called on an already-running
 * worker.
 */
let workerStartup: Promise<void> | undefined;

function startWorkerOnce(): Promise<void> {
  workerStartup ??= import("@/mocks/browser").then(({ worker }) =>
    worker.start({ onUnhandledRequest: "bypass" }).then(() => undefined),
  );
  return workerStartup;
}

/**
 * Starts the Mock Service Worker before anything renders, so CRM screens can be
 * built against endpoints `physio-api` has not shipped yet. Set
 * `NEXT_PUBLIC_API_MOCKING=enabled` to turn it on; with it unset this component
 * renders its children immediately and never loads MSW.
 *
 * If the worker cannot start — no service worker support in the browser, for
 * instance — the app still renders and calls go to the real API rather than
 * leaving a blank page behind.
 */
export function MockApiProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(!isApiMockingEnabled);

  useEffect(() => {
    if (!isApiMockingEnabled) {
      return;
    }

    let isMounted = true;
    const markReady = () => {
      if (isMounted) {
        setIsReady(true);
      }
    };

    startWorkerOnce().then(markReady, (error: unknown) => {
      console.error("[MSW] Mocking is disabled for this session.", error);
      markReady();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
