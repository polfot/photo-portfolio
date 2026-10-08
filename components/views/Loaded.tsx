"use client";

import type { ReactNode } from "react";
import type { DataState } from "@/lib/useData";
import { LoadingScreen } from "./LoadingScreen";

type Props<T> = {
  state: DataState<T>;
  children: (data: T) => ReactNode;
  // Pages where the photos are the first thing you see cover the screen while loading.
  loadingScreen?: boolean;
};

// Renders a loading state, a short message on failure, and fades the content in once it arrives.
export function Loaded<T>({ state, children, loadingScreen = false }: Props<T>) {
  if (state.status === "loading") return loadingScreen ? <LoadingScreen /> : null;
  if (state.status === "error") return <p className="status-message">Could not load this page. Please try again.</p>;
  return <div className="appear">{children(state.data)}</div>;
}
