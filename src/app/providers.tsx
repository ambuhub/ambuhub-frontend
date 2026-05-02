"use client";

import type { ReactNode } from "react";
import { SessionCartProvider } from "@/components/session-cart/SessionCartProvider";

export function ClientRootProviders({ children }: { children: ReactNode }) {
  return <SessionCartProvider>{children}</SessionCartProvider>;
}
