import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo-metadata";
import { VerifyEmailOtpForm } from "@/components/auth/VerifyEmailOtpForm";

export const metadata: Metadata = privatePageMetadata(
  "Verify email",
  "Enter the verification code sent to your email.",
);

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[100dvh] flex-1 flex-col bg-gradient-to-b from-ambuhub-50 via-white to-ambuhub-surface/40">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <VerifyEmailOtpForm />
      </main>
    </div>
  );
}
