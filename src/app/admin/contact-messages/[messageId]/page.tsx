"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminContactDetail,
  patchAdminContactStatus,
  type AdminContactDetail,
  type AdminContactStatus,
} from "@/lib/admin-contact-messages";

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: AdminContactDetail["status"]): string {
  if (status === "archived") return "Archived";
  if (status === "read") return "Read";
  return "New";
}

export default function AdminContactMessageDetailPage() {
  const params = useParams();
  const messageId =
    typeof params.messageId === "string" ? params.messageId : "";

  const [message, setMessage] = useState<AdminContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadMessage = useCallback(async () => {
    if (!messageId) {
      setError("Invalid message id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminContactDetail(messageId);
      setMessage(data);
      if (data.status === "new") {
        try {
          const updated = await patchAdminContactStatus(messageId, "read");
          setMessage(updated);
        } catch {
          /* leave as new if mark-read fails */
        }
      }
    } catch (err) {
      setMessage(null);
      setError(
        err instanceof Error ? err.message : "Could not load contact message.",
      );
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    void loadMessage();
  }, [loadMessage]);

  async function updateStatus(status: AdminContactStatus) {
    if (!messageId) return;
    setStatusSaving(true);
    setStatusError(null);
    try {
      const updated = await patchAdminContactStatus(messageId, status);
      setMessage(updated);
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Could not update status.",
      );
    } finally {
      setStatusSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/admin/contact-messages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to contact messages
      </Link>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden />
        </div>
      ) : error ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      ) : message ? (
        <>
          <AdminPageHeader
            theme="blue"
            title={message.name}
            description={`${message.subjectLabel} · Submitted ${formatDateTime(message.createdAt)}`}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Message
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Subject</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {message.subjectLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Status</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {statusLabel(message.status)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Submitted
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatDateTime(message.createdAt)}
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Body
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {message.message}
                </p>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Sender
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-2.5">
                    <User
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden
                    />
                    <span className="font-medium text-slate-900">
                      {message.name}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Mail
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden
                    />
                    <a
                      href={`mailto:${encodeURIComponent(message.email)}`}
                      className="break-all font-medium text-indigo-700 hover:text-indigo-900"
                    >
                      {message.email}
                    </a>
                  </li>
                  {message.phone ? (
                    <li className="flex items-start gap-2.5">
                      <Phone
                        className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden
                      />
                      <a
                        href={`tel:${message.phone.replace(/\s+/g, "")}`}
                        className="font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        {message.phone}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Update status
                </h2>
                <div className="mt-4 flex flex-col gap-2">
                  {(
                    [
                      ["new", "Mark as new"],
                      ["read", "Mark as read"],
                      ["archived", "Archive"],
                    ] as const
                  ).map(([status, label]) => (
                    <button
                      key={status}
                      type="button"
                      disabled={statusSaving || message.status === status}
                      onClick={() => void updateStatus(status)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {statusError ? (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    {statusError}
                  </p>
                ) : null}
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
