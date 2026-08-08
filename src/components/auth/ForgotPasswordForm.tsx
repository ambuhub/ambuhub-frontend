"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { API_AUTH_BFF_PREFIX } from "@/lib/api";

const OTP_LENGTH = 6;

type Step = "email" | "otp" | "password" | "done";

type Props = {
  initialEmail?: string;
  onBackToLogin: () => void;
};

function secondsUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

export function ForgotPasswordForm({ initialEmail = "", onBackToLogin }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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
    focusIndex(Math.min(index + chars.length, OTP_LENGTH - 1));
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

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as {
        message?: string;
        resendAvailableAt?: string;
        /** seconds until resend is allowed */
        cooldownSeconds?: number;
        resendCooldownAfterSeconds?: number;
      };
      if (!res.ok) {
        setError(data.message ?? "Could not send verification code");
        return;
      }
      setEmail(trimmed);
      setCooldown(
        (data.resendCooldownAfterSeconds ??
          data.cooldownSeconds ??
          secondsUntil(data.resendAvailableAt)) ||
          90,
      );
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setInfo("If an account exists for that email, we sent a 6-digit code.");
      setStep("otp");
      window.setTimeout(() => focusIndex(0), 50);
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/forgot-password/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as {
        message?: string;
        resendAvailableAt?: string;
        resendCooldownAfterSeconds?: number;
      };
      if (!res.ok) {
        setError(data.message ?? "Could not resend code");
        if (res.status === 429) {
          setCooldown(
            (data.resendCooldownAfterSeconds ??
              secondsUntil(data.resendAvailableAt)) ||
              90,
          );
        }
        return;
      }
      setCooldown(
        (data.resendCooldownAfterSeconds ??
          secondsUntil(data.resendAvailableAt)) ||
          90,
      );
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setInfo("A new verification code was sent to your email.");
      focusIndex(0);
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setResending(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = (await res.json()) as {
        message?: string;
        resetToken?: string;
      };
      if (!res.ok || !data.resetToken) {
        setError(data.message ?? "Invalid or expired code");
        return;
      }
      setResetToken(data.resetToken);
      setStep("password");
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_AUTH_BFF_PREFIX}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = (await res.json()) as { message?: string; ok?: boolean };
      if (!res.ok) {
        setError(data.message ?? "Could not update password");
        return;
      }
      setSuccessMessage(
        data.message ??
          "Password updated successfully. You can sign in with your new password.",
      );
      setStep("done");
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-ambuhub-200 bg-white px-4 py-3 text-foreground outline-none transition-shadow focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25";
  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <div className="w-full max-w-md rounded-2xl border border-ambuhub-100 bg-white p-6 shadow-lg shadow-ambuhub-900/5 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {step === "done" ? "Password updated" : "Reset password"}
      </h1>
      <p className="mt-2 text-sm text-foreground/65">
        {step === "email"
          ? "Enter your account email and we will send a 6-digit verification code."
          : step === "otp"
            ? `Enter the code we sent to ${email}.`
            : step === "password"
              ? "Choose a new password for your account."
              : "Your password has been changed successfully."}
      </p>

      {step === "email" ? (
        <form onSubmit={(e) => void handleRequestCode(e)} className="mt-8 space-y-5">
          <div>
            <label htmlFor="forgot-email" className={labelClass}>
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="you@example.com"
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {loading ? "Sending…" : "Send verification code"}
          </button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={(e) => void handleVerifyOtp(e)} className="mt-8 space-y-5">
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
                className="h-12 w-10 rounded-xl border border-slate-200 bg-white text-center text-lg font-semibold text-slate-900 outline-none transition focus:border-ambuhub-brand focus:ring-2 focus:ring-ambuhub-brand/25 sm:h-14 sm:w-12"
              />
            ))}
          </div>
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900" role="status">
              {info}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {loading ? "Verifying…" : "Verify code"}
          </button>
          <div className="text-center text-sm text-foreground/70">
            {cooldown > 0 ? (
              <p>
                Resend code available in{" "}
                <span className="font-semibold text-foreground">{cooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={resending}
                className="font-semibold text-ambuhub-brand hover:underline disabled:opacity-60"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
              setInfo(null);
            }}
            className="w-full text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Use a different email
          </button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={(e) => void handleResetPassword(e)} className="mt-8 space-y-5">
          <div>
            <label htmlFor="forgot-new-password" className={labelClass}>
              New password
            </label>
            <input
              id="forgot-new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={fieldClass}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="forgot-confirm-password" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="forgot-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={fieldClass}
              placeholder="Repeat new password"
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      ) : null}

      {step === "done" ? (
        <div className="mt-8 space-y-5">
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
            <p className="flex items-start gap-2 font-medium">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {successMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full rounded-xl bg-ambuhub-brand py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ambuhub-brand-dark"
          >
            Back to sign in
          </button>
        </div>
      ) : null}

      {step !== "done" ? (
        <p className="mt-8 text-center text-sm text-foreground/70">
          <button
            type="button"
            onClick={onBackToLogin}
            className="font-semibold text-ambuhub-brand hover:text-ambuhub-brand-dark hover:underline"
          >
            Back to sign in
          </button>
        </p>
      ) : null}
    </div>
  );
}
