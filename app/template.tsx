import { ViewTransition, type ReactNode } from "react";

// A template remounts on every navigation, so this one wrapper fades every page out and the next one in.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-fade" exit="page-fade" default="none">
      {children}
    </ViewTransition>
  );
}
