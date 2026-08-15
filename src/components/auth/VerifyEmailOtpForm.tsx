"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AmbuhubLogo } from "@/components/AmbuhubLogo";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import { API_AUTH_BFF_PREFIX } from "@/lib/api";
import { postAuthPath, type AuthUserRole } from "@/lib/auth-redirect";

const OTP_LENGTH = 6;

type VerifyStatus = {
  email: string;
  emailVerified: boolean;
  role?: string;
  expiresAt: string | null;
  resendAvailableAt: string | null;
  resendCooldownAfterSeconds: number;
};

function secondsUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

export function VerifyEmailOtpForm() {
  const router = useRouter();
  const { refresh: refreshSession } = useSessionAndCart();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [email, setEmail] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const applyResendWindow = useCallback((resendAvailableAt?: string | null) => {
    setCooldown(secondsUntil(resendAvailableAt));
  }, []);

  const loadStatus = useEffectEvent(async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/verify-email`, {
        credentials: "include",
      });
      const data = (await res.json()) as VerifyStatus & { message?: string };
      if (res.status === 401) {
        router.replace("/auth");
        return;
      }
      if (!res.ok) {
        setError(data.message ?? "Could not load verification status.");
        return;
      }
      if (data.emailVerified) {
        await refreshSession();
        const role = data.role;
        const next =
          role === "service_provider" ||
          role === "client" ||
          role === "patient" ||
          role === "dispatch"
            ? postAuthPath(role as AuthUserRole)
            : "/";
        router.replace(next);
        return;
      }
      setEmail(data.email);
      applyResendWindow(data.resendAvailableAt);
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoadingStatus(false);
    }
  });

  useEffect(() => {
    void loadStatus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  function focusIndex(index: number) {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  }

  function updateDigit(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const chars = cleaned.slice(0, OTP_LENGTH - index).split("");
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      return next;
    });
    const nextFocus = Math.min(index + chars.length, OTP_LENGTH - 1);
    focusIndex(nextFocus);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      focusIndex(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    const chars = pasted.slice(0, OTP_LENGTH).split("");
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((char, i) => {
        next[i] = char;
      });
      return next;
    });
    focusIndex(Math.min(chars.length, OTP_LENGTH) - 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/verify-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as {
        message?: string;
        user?: { role?: string; emailVerified?: boolean };
      };
      if (!res.ok) {
        setError(data.message ?? "Verification failed");
        return;
      }
      const role = data.user?.role;
      await refreshSession();
      const next =
        role === "service_provider" ||
        role === "client" ||
        role === "patient" ||
        role === "dispatch"
          ? postAuthPath(role as AuthUserRole)
          : "/";
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/verify-email/resend`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        message?: string;
        otp?: { resendAvailableAt?: string };
      };
      if (!res.ok) {
        setError(data.message ?? "Could not resend code");
        if (res.status === 429) {
          applyResendWindow(data.otp?.resendAvailableAt);
        }
        return;
      }
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      applyResendWindow(data.otp?.resendAvailableAt);
      setInfo("A new verification code was sent to your email.");
      focusIndex(0);
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setResending(false);
    }
  }

  if (loadingStatus) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-800" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex flex-col items-center text-center">
        <AmbuhubLogo width={56} className="object-contain" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-slate-800">{email || "your email"}</span>.
          The code expires in 15 minutes.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={(e) => void handleSubmit(e)}>
        <div className="flex justify-center gap-2 sm:gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1}`}
              maxLength={1}
              value={digit}
              onChange={(e) => updateDigit(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="h-12 w-10 rounded-xl border border-slate-200 bg-white text-center text-lg font-semibold text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 sm:h-14 sm:w-12"
            />
          ))}
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        {info ? (
          <p
            className="rounded-xl bg-green-50 px-3 py-2 text-center text-sm text-green-900"
            role="status"
          >
            {info}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-800 hover:to-blue-600 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          Verify email
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-600">
        {cooldown > 0 ? (
          <p>
            Resend code available in{" "}
            <span className="font-semibold text-slate-800">{cooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={resending}
            className="font-semibold text-blue-800 hover:underline disabled:opacity-60"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>
    </div>
  );
}
