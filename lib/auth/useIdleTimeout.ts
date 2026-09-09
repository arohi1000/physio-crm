"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** TRD idle policy: signed out after 30 minutes of no interaction… */
export const idleTimeoutMs = 30 * 60 * 1000;
/** …with the last 2 of those spent warning, so nobody loses a half-typed note silently. */
export const idleWarningMs = 2 * 60 * 1000;

const activityEvents = ["pointerdown", "keydown", "wheel"] as const;
const pollIntervalMs = 1000;

export type UseIdleTimeoutOptions = {
  isEnabled: boolean;
  onIdle: () => void;
};

export type UseIdleTimeoutResult = {
  /** Seconds left before sign-out, or `null` while the session is not close to timing out. */
  secondsUntilIdle: number | null;
  /** Counts the warning as answered and starts the clock again. */
  extendSession: () => void;
};

/**
 * Polls a single "last interaction" timestamp rather than resetting a chain of
 * timeouts, so a machine that slept through the window is signed out on the
 * next tick instead of counting sleep as activity.
 *
 * State is only written inside the warning window — React bails out of a
 * `null` → `null` set — so the common case does not re-render every second.
 */
export function useIdleTimeout({ isEnabled, onIdle }: UseIdleTimeoutOptions): UseIdleTimeoutResult {
  const [secondsUntilIdle, setSecondsUntilIdle] = useState<number | null>(null);
  // Seeded when the timeout is enabled, because rendering is not an interaction.
  const lastActivityAtRef = useRef(0);
  const isWarningRef = useRef(false);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const extendSession = useCallback(() => {
    lastActivityAtRef.current = Date.now();
    isWarningRef.current = false;
    setSecondsUntilIdle(null);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    lastActivityAtRef.current = Date.now();
    isWarningRef.current = false;

    // While the warning is up the prompt must be answered: a stray scroll over
    // the page is not a deliberate "I'm still here".
    const recordActivity = () => {
      if (!isWarningRef.current) {
        lastActivityAtRef.current = Date.now();
      }
    };

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }

    const intervalId = window.setInterval(() => {
      const remainingMs = idleTimeoutMs - (Date.now() - lastActivityAtRef.current);

      if (remainingMs <= 0) {
        isWarningRef.current = false;
        setSecondsUntilIdle(null);
        onIdleRef.current();
        return;
      }

      const isWarning = remainingMs <= idleWarningMs;
      isWarningRef.current = isWarning;
      setSecondsUntilIdle(isWarning ? Math.ceil(remainingMs / 1000) : null);
    }, pollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, recordActivity);
      }
    };
  }, [isEnabled]);

  return { secondsUntilIdle, extendSession };
}
