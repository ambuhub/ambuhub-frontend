"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  fetchDispatchAccounts,
  setDispatchAccountDisabled,
  type DispatchAccountDto,
} from "@/lib/provider-dispatch-accounts";

export function ProviderDispatchAccountsList() {
  const [accounts, setAccounts] = useState<DispatchAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const nextAccounts = await fetchDispatchAccounts();
      setAccounts(nextAccounts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleToggleDisabled(account: DispatchAccountDto) {
    setTogglingId(account.id);
    setError(null);
    try {
      const updated = await setDispatchAccountDisabled(
        account.id,
        !account.isDisabled,
      );
      setAccounts((list) =>
        list.map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update account");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Crew accounts linked to your ground ambulance listings. Enable or
        disable a login here.
      </p>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-600">
          No dispatch accounts yet. Create one from the Create Dispatch tab.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Crew</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Duty</th>
                <th className="px-4 py-3">Active request</th>
                <th className="px-4 py-3">Last outcome</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {account.firstName} {account.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{account.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {account.listingTitle}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        account.dispatchEnabled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {account.dispatchEnabled ? "On duty" : "Off duty"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {account.activeRequestStatus ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {account.lastAttemptOutcome ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={togglingId === account.id}
                      onClick={() => void handleToggleDisabled(account)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                        account.isDisabled
                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {togglingId === account.id ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden
                        />
                      ) : account.isDisabled ? (
                        "Enable"
                      ) : (
                        "Disable"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
