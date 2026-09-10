"use client";

import { listServices, type Service } from "@/lib/api/public/services";
import { useApiResource, type ApiResourceState } from "@/lib/hooks/useApiResource";

/** Services rarely change within a session; every screen that needs the list shares this loader shape. */
export function useServices(): ApiResourceState<Service[]> {
  return useApiResource(() => listServices(), []);
}
