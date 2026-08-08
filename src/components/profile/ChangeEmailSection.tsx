"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useSessionAndCart } from "@/components/session-cart/SessionCartProvider";
import type { PublicAuthUser } from "@/lib/auth-redirect";
import {
  requestChangeEmail,
  resendChangeEmail,
  verifyChangeEmail,
} from "@/lib/client-profile";

const OTP_LENGTH = 6;

type Accent = "client" | "provider";

type ChangeEmailSectionProps = {
  currentEmail: string;
  accent?: Accent;
  onEmailChanged: (user: PublicAuthUser) => void;
};

function secondsUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

const accents: Record<
  Accent,
  {
    section: string;
    title: string;
    focus: string;
    button: string;
    otpFocus: string;
  }
> = {
  client: {
    section: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
    title: "text-[#0c4a6e]",
    focus:
      "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25",
    button:
      "bg-[#0069b4] hover:bg-[#004a7c]",
    otpFocus: "focus:border-cyan-500 focus:ring-cyan-500/25",
  },
  provider: {
    section:
      "relative overflow-hidden rounded-2xl border border-blue-200/60 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6",
    title: "text-slate-900",
    focus: "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25",
    button: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95",
    otpFocus: "focus:border-blue-500 focus:ring-blue-500/25",
  },
};

export function ChangeEmailSection({
  currentEmail,
  accent = "client",
  onEmailChanged,
}: ChangeEmailSectionProps) {
  const { refresh } = useSessionAndCart();
  const styles = accents[accent];
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [step, setStep] = useState<"email" | "otp">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const applyResendWindow = useCallback((resendAvailableAt?: string | null) => {
    setCooldown(secondsUntil(resendAvailableAt));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  function resetOtpDigits() {
    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
  }

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter a new email address.");
      return;
    }
    if (trimmed === currentEmail.trim().toLowerCase()) {
      setError("That is already your current email address.");
      return;
    }
    if (!password) {
      setError("Enter your current password to confirm this change.");
      return;
    }
    setSending(true);
    try {
      const otp = await requestChangeEmail({
        newEmail: trimmed,
        password,
      });
      setPendingEmail(otp.pendingEmail ?? otp.email);
      setPassword("");
      applyResendWindow(otp.resendAvailableAt);
      resetOtpDigits();
      setStep("otp");
      setNotice(`We sent a 6-digit code to ${otp.pendingEmail ?? otp.email}.`);
      window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setSending(false);
    }
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    setDigits(next);
    const focusAt = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusAt]?.focus();
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setVerifying(true);
    try {
      const user = await verifyChangeEmail(code);
      await refresh();
      onEmailChanged(user);
      setNewEmail("");
      setPendingEmail(null);
      resetOtpDigits();
      setStep("email");
      setNotice("Email updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify email.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const otp = await resendChangeEmail();
      setPendingEmail(otp.pendingEmail ?? otp.email);
      applyResendWindow(otp.resendAvailableAt);
      resetOtpDigits();
      setNotice(`A new code was sent to ${otp.pendingEmail ?? otp.email}.`);
      window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  }

  function handleCancelOtp() {
    setStep("email");
    setPendingEmail(null);
    setPassword("");
    resetOtpDigits();
    setError(null);
    setNotice(null);
  }

  const fieldClass = `mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 ${styles.focus}`;

  return (
    <section className={styles.section}>
      {accent === "provider" ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-800 via-blue-500 to-cyan-500"
          aria-hidden
        />
      ) : null}
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-slate-600" aria-hidden />
        <h2 className={`text-lg font-semibold ${styles.title}`}>
          Change email
        </h2>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Confirm with your current password, then we will send a verification
        code to your new email address.
      </p>
      <p className="mt-3 text-sm text-slate-500">
        Current email:{" "}
        <span className="font-medium text-slate-800">{currentEmail}</span>
      </p>

      {step === "email" ? (
        <form className="mt-5 space-y-4" onSubmit={(e) => void handleRequestCode(e)}>
          <div>
            <label
              htmlFor="change-email-new"
              className="block text-sm font-medium text-slate-700"
            >
              New email address
            </label>
            <input
              id="change-email-new"
              type="email"
              required
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={fieldClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="change-email-password"
              className="block text-sm font-medium text-slate-700"
            >
              Current password
            </label>
            <input
              id="change-email-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p
              className="flex items-center gap-2 text-sm text-green-800"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              {notice}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={sending}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:opacity-60 ${styles.button}`}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Send verification code
          </button>
        </form>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={(e) => void handleVerify(e)}>
          <p className="text-sm text-slate-600">
            Enter the code sent to{" "}
            <span className="font-medium text-slate-800">
              {pendingEmail ?? newEmail}
            </span>
            .
          </p>
          <div className="flex flex-wrap gap-2" onPaste={handleOtpPaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                aria-label={`Digit ${index + 1}`}
                onChange={(e) => updateDigit(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={`h-12 w-10 rounded-xl border border-slate-200 bg-white text-center text-lg font-semibold text-slate-900 outline-none transition focus:ring-2 ${styles.otpFocus}`}
              />
            ))}
          </div>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="text-sm text-slate-600" role="status">
              {notice}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={verifying}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:opacity-60 ${styles.button}`}
            >
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Verify and update email
            </button>
            <button
              type="button"
              disabled={resending || cooldown > 0}
              onClick={() => void handleResend()}
              className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
            >
              {resending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend code"}
            </button>
            <button
              type="button"
              onClick={handleCancelOtp}
              className="text-sm font-medium text-slate-500 underline-offset-2 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
