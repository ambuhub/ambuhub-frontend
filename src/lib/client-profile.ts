import { API_AUTH_BFF_PREFIX } from "@/lib/api";
import type { PublicAuthUser } from "@/lib/auth-redirect";

export type UpdateClientProfilePayload = {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  dateOfBirth: string;
};

export async function patchClientProfile(
  payload: UpdateClientProfilePayload,
): Promise<PublicAuthUser> {
  const res = await fetch(`${API_AUTH_BFF_PREFIX}/me`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { user?: PublicAuthUser; message?: string };
  if (res.status === 401) {
    throw new Error("Sign in to update your profile.");
  }
  if (res.status === 403) {
    throw new Error(data.message ?? "This account cannot update profile here.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not update profile.");
  }
  if (!data.user) {
    throw new Error("Profile was not returned");
  }
  return data.user;
}

export async function postChangePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch(`${API_AUTH_BFF_PREFIX}/change-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { message?: string };
  if (res.status === 401) {
    throw new Error(data.message ?? "Current password is incorrect.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not change password.");
  }
}

export type ChangeEmailOtpResult = {
  email: string;
  pendingEmail?: string;
  expiresAt: string;
  resendAvailableAt: string;
  resendCooldownAfterSeconds: number;
};

export async function requestChangeEmail(input: {
  newEmail: string;
  password: string;
}): Promise<ChangeEmailOtpResult> {
  const res = await fetch(`${API_AUTH_BFF_PREFIX}/change-email`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      newEmail: input.newEmail,
      password: input.password,
    }),
  });
  const data = (await res.json()) as {
    otp?: ChangeEmailOtpResult;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not send verification code.");
  }
  if (!data.otp) {
    throw new Error("Verification details were not returned.");
  }
  return data.otp;
}

export async function verifyChangeEmail(code: string): Promise<PublicAuthUser> {
  const res = await fetch(`${API_AUTH_BFF_PREFIX}/change-email/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = (await res.json()) as {
    user?: PublicAuthUser;
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in to change your email.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not verify new email.");
  }
  if (!data.user) {
    throw new Error("Updated profile was not returned.");
  }
  return data.user;
}

export async function resendChangeEmail(): Promise<ChangeEmailOtpResult> {
  const res = await fetch(`${API_AUTH_BFF_PREFIX}/change-email/resend`, {
    method: "POST",
    credentials: "include",
  });
  const data = (await res.json()) as {
    otp?: ChangeEmailOtpResult;
    message?: string;
  };
  if (res.status === 401) {
    throw new Error("Sign in to change your email.");
  }
  if (!res.ok) {
    throw new Error(data.message ?? "Could not resend verification code.");
  }
  if (!data.otp) {
    throw new Error("Verification details were not returned.");
  }
  return data.otp;
}
