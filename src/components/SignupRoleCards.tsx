"use client";

import { Building2, UserRound } from "lucide-react";

export type SignupRole = "patient" | "service_provider";

type Props = {
  onSelectRole: (role: SignupRole) => void;
  onBackToLogin: () => void;
};

export function SignupRoleCards({ onSelectRole, onBackToLogin }: Props) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-lg shadow-ambuhub-900/5 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Create an account
      </h1>
      <p className="mt-2 text-sm text-foreground/65">
        Choose how you will use Ambuhub. You can use a different email for each
        role if needed.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
        <button
          type="button"
          onClick={() => onSelectRole("patient")}
          className="group flex flex-col items-start rounded-2xl border-2 border-ambuhub-100 bg-ambuhub-surface/50 p-6 text-left transition-all hover:border-ambuhub-brand hover:bg-ambuhub-50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambuhub-brand"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ambuhub-brand text-white shadow-sm transition-transform group-hover:scale-105">
            <UserRound className="h-6 w-6" aria-hidden />
          </span>
          <span className="mt-4 text-lg font-semibold text-foreground">
            Sign up as a patient
          </span>
          <span className="mt-2 text-sm leading-relaxed text-foreground/65">
            Book standby and transport, browse listings, and keep your bookings
            organized.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole("service_provider")}
          className="group flex flex-col items-start rounded-2xl border-2 border-ambuhub-100 bg-ambuhub-surface/50 p-6 text-left transition-all hover:border-ambuhub-brand hover:bg-ambuhub-50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambuhub-brand"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ambuhub-800 text-white shadow-sm transition-transform group-hover:scale-105">
            <Building2 className="h-6 w-6" aria-hidden />
          </span>
          <span className="mt-4 text-lg font-semibold text-foreground">
            Sign up as a service provider
          </span>
          <span className="mt-2 text-sm leading-relaxed text-foreground/65">
            Ambulance operators, medics, and vendors listing coverage, shifts, and
            equipment.
          </span>
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-foreground/70">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onBackToLogin}
          className="font-semibold text-ambuhub-brand hover:text-ambuhub-brand-dark hover:underline"
        >
          Log in
        </button>
      </p>
    </div>
  );
}
