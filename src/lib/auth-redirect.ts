export type AuthUserRole = "patient" | "service_provider";

export type PublicAuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthUserRole;
  emailVerified: boolean;
};

export function postAuthPath(role: AuthUserRole): string {
  if (role === "service_provider") {
    return "/provider/dashboard";
  }
  return "/";
}
