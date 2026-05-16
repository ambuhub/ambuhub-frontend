import { API_AUTH_BFF_PREFIX } from "@/lib/api";
import type { PublicAuthUser } from "@/lib/auth-redirect";

export type UpdateProviderProfilePayload = {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  businessName: string;
  physicalAddress: string;
  website?: string;
};

export async function patchProviderProfile(
  payload: UpdateProviderProfilePayload,
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
