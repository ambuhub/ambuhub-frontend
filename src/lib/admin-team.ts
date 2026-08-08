import { API_PROXY_PREFIX } from "@/lib/api";
import type { AdminUserListItem } from "@/lib/admin-users";

export type CreateAdminTeamMemberInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
};

function adminTeamError(res: Response, data: { message?: string }): Error {
  if (res.status === 401) {
    return new Error("Sign in as an admin to manage the team.");
  }
  if (res.status === 403) {
    return new Error("Admin access required.");
  }
  return new Error(data.message ?? "Could not complete team request.");
}

export async function createAdminTeamMember(
  input: CreateAdminTeamMemberInput,
): Promise<AdminUserListItem> {
  const res = await fetch(`${API_PROXY_PREFIX}/admin/team`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as {
    user?: AdminUserListItem;
    message?: string;
  };

  if (!res.ok || !data.user) {
    throw adminTeamError(res, data);
  }

  return data.user;
}
