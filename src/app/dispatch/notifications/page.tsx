"use client";

import { NotificationInbox } from "@/components/notifications/NotificationInbox";

export default function DispatchNotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <NotificationInbox
        title="Notifications"
        description="Incoming ambulance requests and trip updates for this dispatch account."
      />
    </div>
  );
}
