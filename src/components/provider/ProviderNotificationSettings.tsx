"use client";

import { Bell, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationCategory,
  type NotificationCategoryPreferences,
} from "@/lib/notifications";

const sectionClass =
  "relative overflow-hidden rounded-2xl border border-blue-200/60 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6";

const accentBarClass =
  "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-500";

const ALL_CATEGORIES: NotificationCategory[] = [
  "ambulance_updates",
  "booking_updates",
  "payments",
  "chat_messages",
  "concierge",
  "marketing",
  "general",
];

const PROVIDER_CATEGORY_TOGGLES: {
  key: NotificationCategory;
  label: string;
  description: string;
}[] = [
  {
    key: "ambulance_updates",
    label: "Ambulance updates",
    description: "Dispatch requests, acceptances, and trip status.",
  },
  {
    key: "booking_updates",
    label: "Booking updates",
    description: "Hire bookings, confirmations, and return reminders.",
  },
  {
    key: "payments",
    label: "Payments",
    description: "Sales, payouts, and payment status.",
  },
  {
    key: "general",
    label: "General",
    description: "Account and other product updates.",
  },
];

function allCategories(value: boolean): NotificationCategoryPreferences {
  return Object.fromEntries(
    ALL_CATEGORIES.map((key) => [key, value]),
  ) as NotificationCategoryPreferences;
}

function isPushEnabled(categories: NotificationCategoryPreferences): boolean {
  return ALL_CATEGORIES.some((key) => categories[key]);
}

function Toggle({
  checked,
  disabled,
  onChange,
  id,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  id: string;
  label: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-blue-600" : "bg-slate-300",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export function ProviderNotificationSettings() {
  const [categories, setCategories] =
    useState<NotificationCategoryPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const prefs = await fetchNotificationPreferences();
      setCategories(prefs.categories);
    } catch (err) {
      setCategories(null);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Could not load notification preferences.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(
    async (
      key: string,
      patch: Partial<NotificationCategoryPreferences>,
      previous: NotificationCategoryPreferences,
    ) => {
      setSavingKey(key);
      setSaveError(null);
      try {
        const prefs = await updateNotificationPreferences(patch);
        setCategories(prefs.categories);
      } catch (err) {
        setCategories(previous);
        setSaveError(
          err instanceof Error
            ? err.message
            : "Could not update notification preferences.",
        );
      } finally {
        setSavingKey(null);
      }
    },
    [],
  );

  const onMasterToggle = (next: boolean) => {
    if (!categories || savingKey) return;
    const previous = categories;
    const patch = allCategories(next);
    setCategories(patch);
    void persist("master", patch, previous);
  };

  const onCategoryToggle = (key: NotificationCategory, next: boolean) => {
    if (!categories || savingKey) return;
    const previous = categories;
    const optimistic = { ...categories, [key]: next };
    setCategories(optimistic);
    void persist(key, { [key]: next }, previous);
  };

  const pushOn = categories ? isPushEnabled(categories) : false;
  const busy = savingKey != null;

  return (
    <section className={sectionClass}>
      <div className={accentBarClass} aria-hidden />
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Bell className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          <p className="mt-1 text-sm text-slate-600">
            Turning push off stops mobile and web push only. Your in-app
            notifications inbox still receives items.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading preferences…
        </div>
      ) : loadError ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-red-600" role="alert">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : categories ? (
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Push notifications
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Master control for all push categories
              </p>
            </div>
            <Toggle
              id="push-master"
              label="Push notifications"
              checked={pushOn}
              disabled={busy}
              onChange={onMasterToggle}
            />
          </div>

          {pushOn ? (
            <ul className="space-y-4">
              {PROVIDER_CATEGORY_TOGGLES.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                  <Toggle
                    id={`push-${item.key}`}
                    label={item.label}
                    checked={categories[item.key]}
                    disabled={busy}
                    onChange={(next) => onCategoryToggle(item.key, next)}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {saveError ? (
            <p className="text-sm text-red-600" role="alert">
              {saveError}
            </p>
          ) : null}
          {busy ? (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Saving…
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
