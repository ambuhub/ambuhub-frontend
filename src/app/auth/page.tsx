"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import {
  SignupRoleCards,
  type SignupRole,
} from "@/components/SignupRoleCards";
import { AuthSignupSplitShell } from "@/components/auth/AuthSignupSplitShell";

type Step = "login" | "pick-role" | "signup";

function AuthLoginShell({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const afterLoginRedirect = useSearchParams().get("next");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-ambuhub-50 via-white to-ambuhub-surface/40">
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <LoginForm
            onSwitchToSignup={onSwitchToSignup}
            afterLoginRedirect={afterLoginRedirect}
          />
        </div>
        <p className="mt-10 max-w-md text-center text-xs text-foreground/50">
          If someone needs immediate professional medical care, contact your local
          medical helpline or public ambulance service.{" "}
          <Link href="/" className="text-ambuhub-brand hover:underline">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function AuthPage() {
  const [step, setStep] = useState<Step>("login");
  const [role, setRole] = useState<SignupRole | null>(null);

  const disclaimer = (
    <p className="mx-auto mt-12 max-w-xl text-center text-xs text-slate-500">
      If someone needs immediate professional medical care, contact your local
      medical helpline or public ambulance service.{" "}
      <Link href="/" className="font-medium text-blue-800 hover:underline">
        Back to home
      </Link>
    </p>
  );

  if (step === "pick-role") {
    return (
      <AuthSignupSplitShell
        onPrevious={() => setStep("login")}
        onLogIn={() => setStep("login")}
      >
        <div className="mx-auto w-full max-w-2xl">
          <SignupRoleCards
            onSelectRole={(r) => {
              setRole(r);
              setStep("signup");
            }}
          />
          {disclaimer}
        </div>
      </AuthSignupSplitShell>
    );
  }

  if (step === "signup" && role !== null) {
    return (
      <AuthSignupSplitShell
        onPrevious={() => {
          setStep("pick-role");
          setRole(null);
        }}
        onLogIn={() => setStep("login")}
      >
        <div className="mx-auto w-full max-w-2xl">
          <SignupForm role={role} onBack={() => setStep("pick-role")} splitLayout />
          {disclaimer}
        </div>
      </AuthSignupSplitShell>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center text-sm text-foreground/60">
          Loading…
        </div>
      }
    >
      <AuthLoginShell onSwitchToSignup={() => setStep("pick-role")} />
    </Suspense>
  );
}
