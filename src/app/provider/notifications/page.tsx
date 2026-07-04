"use client";

import { NotificationInbox } from "@/components/notifications/NotificationInbox";

export default function ProviderNotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <NotificationInbox
        title="Notifications"
        description="Alerts when your listings are sold or hired, plus reminders before customer return deadlines."
      />
    </div>
  );
}
