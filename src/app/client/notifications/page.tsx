"use client";

import { NotificationInbox } from "@/components/notifications/NotificationInbox";

export default function ClientNotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <NotificationInbox
        title="Notifications"
        description="Updates about your bookings, payments, hire return reminders, and more."
      />
    </div>
  );
}
