"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ConciergeBell,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPlaceholderPanel";
import {
  fetchAdminConciergeDetail,
  type AdminConciergeDetail,
} from "@/lib/admin-concierge";
import { getCountryNameByCode } from "@/lib/countries";

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

function statusLabel(status: AdminConciergeDetail["status"]): string {
  if (status === "in_progress") return "In progress";
  if (status === "resolved") return "Resolved";
  return "Pending";
}

export default function AdminConciergeRequestDetailPage() {
  const params = useParams();
  const requestId = typeof params.requestId === "string" ? params.requestId : "";

  const [request, setRequest] = useState<AdminConciergeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequest = useCallback(async () => {
    if (!requestId) {
      setError("Invalid request id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminConciergeDetail(requestId);
      setRequest(data);
    } catch (err) {
      setRequest(null);
      setError(
        err instanceof Error ? err.message : "Could not load concierge request.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  const countryName = request
    ? getCountryNameByCode(request.countryCode) ?? request.countryCode
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/admin/concierge-requests"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to concierge requests
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
      ) : request ? (
        <>
          <AdminPageHeader
            theme="blue"
            title={request.name}
            description={`${request.categoryName} · ${request.departmentName} · Submitted ${formatDateTime(request.createdAt)}`}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Request details
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Category</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {request.categoryName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Department</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {request.departmentName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Status</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {statusLabel(request.status)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Submitted</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatDateTime(request.createdAt)}
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {request.description}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-sky-50/90 to-indigo-100/50 p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-indigo-950">
                <User className="h-4 w-4" aria-hidden />
                Contact
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-800">
                <p className="font-semibold text-slate-900">{request.name}</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                  <a
                    href={`mailto:${encodeURIComponent(request.email)}`}
                    className="break-all text-indigo-700 hover:text-indigo-900"
                  >
                    {request.email}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                  <a
                    href={`tel:${request.phone.replace(/\s/g, "")}`}
                    className="text-indigo-700 hover:text-indigo-900"
                  >
                    {request.phone}
                  </a>
                </p>
                <p>{countryName}</p>
              </div>
              <div className="mt-4">
                <Link
                  href={`/admin/users/${encodeURIComponent(request.userId)}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50"
                >
                  View client profile
                </Link>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ConciergeBell className="h-4 w-4 text-indigo-600" aria-hidden />
              Internal reference
            </h2>
            <p className="mt-2 font-mono text-xs text-slate-600">{request.id}</p>
          </section>
        </>
      ) : null}
    </div>
  );
}
