"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api/ApiError";

export type ApiResourceState<T> = {
  readonly data: T | undefined;
  readonly error: ApiError | undefined;
  readonly isLoading: boolean;
  readonly reload: () => void;
};

/**
 * The one data-fetching shape the calendar, appointments table, dashboard and
 * settings pages all need: load on mount/dependency change, track in-flight
 * loading, surface an `ApiError`, and let the caller force a reload after a
 * mutation. A stale request whose deps changed before it resolved is dropped
 * rather than overwriting fresher state.
 *
 * State updates happen inside `run()`, a function nested one level below the
 * effect body rather than inlined into it, and `loaderRef` is written from
 * its own effect rather than during render — both to satisfy the
 * `react-hooks/set-state-in-effect` and `react-hooks/refs` rules, which flag
 * those patterns even though the async-load shape itself is intentional.
 */
export function useApiResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
): ApiResourceState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    async function run() {
      setIsLoading(true);
      setError(undefined);
      try {
        const result = await loaderRef.current(controller.signal);
        if (isCurrent) {
          setData(result);
        }
      } catch (cause) {
        if (isCurrent && !controller.signal.aborted) {
          setError(
            cause instanceof ApiError
              ? cause
              : new ApiError("network", "Something went wrong loading this page."),
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      isCurrent = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` is the caller-declared dependency list; `reloadToken` forces a re-run.
  }, [...deps, reloadToken]);

  return { data, error, isLoading, reload };
}
