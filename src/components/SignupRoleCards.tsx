"use client";

import { Building2, UserRound } from "lucide-react";

export type SignupRole = "client" | "service_provider";

type Props = {
  onSelectRole: (role: SignupRole) => void;
};

export function SignupRoleCards({ onSelectRole }: Props) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        How would you be using Ambuhub?
      </h2>

      <div className="mt-10 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => onSelectRole("client")}
          className="group flex w-full items-center justify-between gap-6 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-blue-50/40 px-6 py-5 text-left shadow-sm transition-all hover:border-blue-400/70 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">
              I&apos;m a client
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Book standby and transport, browse listings, and keep your bookings
              organized.
            </p>
          </div>
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-800 to-blue-600 shadow-md shadow-blue-900/25 transition-transform group-hover:scale-105"
            aria-hidden
          >
            <UserRound className="h-6 w-6 text-white" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole("service_provider")}
          className="group flex w-full items-center justify-between gap-6 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-cyan-50/35 px-6 py-5 text-left shadow-sm transition-all hover:border-blue-400/70 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-slate-900">
              I&apos;m a service provider
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Ambulance operators, medics, and vendors listing coverage, shifts, and
              equipment.
            </p>
          </div>
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-blue-700 shadow-md shadow-blue-950/30 transition-transform group-hover:scale-105"
            aria-hidden
          >
            <Building2 className="h-6 w-6 text-white" />
          </span>
        </button>
      </div>
    </div>
  );
}
