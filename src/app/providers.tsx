"use client";

import type { ReactNode } from "react";
import { FcmProvider } from "@/components/notifications/FcmProvider";
import { NotificationToastProvider } from "@/components/notifications/NotificationToast";
import { SessionCartProvider } from "@/components/session-cart/SessionCartProvider";

export function ClientRootProviders({ children }: { children: ReactNode }) {
  return (
    <SessionCartProvider>
      <NotificationToastProvider>
        <FcmProvider>{children}</FcmProvider>
      </NotificationToastProvider>
    </SessionCartProvider>
  );
}
