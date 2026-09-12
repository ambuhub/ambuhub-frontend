import type { PublicAuthUser } from "@/lib/auth-redirect";

export type AdminTier = "super" | "regular";

/** Legacy admins without `adminTier` are treated as super admins. */
export function resolveAdminTier(
  user: Pick<PublicAuthUser, "role" | "adminTier"> | {
    role: string;
    adminTier?: string | null;
  },
): AdminTier | null {
  if (user.role !== "admin") {
    return null;
  }
  return user.adminTier === "regular" ? "regular" : "super";
}

export function isSuperAdmin(
  user: Pick<PublicAuthUser, "role" | "adminTier"> | {
    role: string;
    adminTier?: string | null;
  } | null | undefined,
): boolean {
  if (!user) return false;
  return resolveAdminTier(user) === "super";
}
