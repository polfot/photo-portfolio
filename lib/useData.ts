"use client";

import { useEffect, useEffectEvent, useState } from "react";

export type DataState<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; message: string };

// Loads live data from Supabase in the browser. Reloads whenever `key` changes (e.g. a different project).
export function useData<T>(key: string, load: () => Promise<T>): DataState<T> {
  const [state, setState] = useState<DataState<T>>({ status: "loading" });
  const run = useEffectEvent(load);

  useEffect(() => {
    let active = true;
    run().then(
      (data) => active && setState({ status: "ready", data }),
      (error: Error) => active && setState({ status: "error", message: error.message }),
    );
    return () => {
      active = false;
    };
  }, [key]);

  return state;
}
