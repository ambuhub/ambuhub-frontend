import { API_PROXY_PREFIX } from "@/lib/api";

export type MyReferral = {
  referralCode: string;
  referralUrl: string;
  successfulReferralCount: number;
  ebookRewardUnlocked: boolean;
  ebookRewardUnlockedAt: string | null;
  ebookUrl: string | null;
};

export async function fetchMyReferral(): Promise<MyReferral> {
  const res = await fetch(`${API_PROXY_PREFIX}/referrals/me`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    referral?: MyReferral;
    message?: string;
  };
  if (!res.ok || !data.referral) {
    if (res.status === 401) {
      throw new Error("Sign in as a client to view your referral link.");
    }
    if (res.status === 403) {
      throw new Error("Only clients can use the referral program.");
    }
    throw new Error(data.message ?? "Could not load referral details.");
  }
  return data.referral;
}
