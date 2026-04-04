"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import {
  SignupRoleCards,
  type SignupRole,
} from "@/components/SignupRoleCards";

type Step = "login" | "pick-role" | "signup";

export default function AuthPage() {
  const [step, setStep] = useState<Step>("login");
  const [role, setRole] = useState<SignupRole | null>(null);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-ambuhub-50 via-white to-ambuhub-surface/40">
      <Header />
      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          {step === "login" && (
            <LoginForm onSwitchToSignup={() => setStep("pick-role")} />
          )}
          {step === "pick-role" && (
            <SignupRoleCards
              onSelectRole={(r) => {
                setRole(r);
                setStep("signup");
              }}
              onBackToLogin={() => setStep("login")}
            />
          )}
          {step === "signup" && role !== null && (
            <SignupForm
              role={role}
              onBack={() => {
                setStep("pick-role");
                setRole(null);
              }}
            />
          )}
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
