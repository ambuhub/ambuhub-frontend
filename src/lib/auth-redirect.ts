export type AuthUserRole = "client" | "service_provider" | "patient";

export type PublicAuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AuthUserRole;
  emailVerified: boolean;
  /** ISO YYYY-MM-DD for clients; null for service providers */
  dateOfBirth: string | null;
  phone: string;
  /** ISO 3166-1 alpha-2 */
  countryCode: string;
  businessName?: string;
  physicalAddress?: string;
  website?: string | null;
};

export function postAuthPath(role: AuthUserRole): string {
  if (role === "service_provider") {
    return "/provider/dashboard";
  }
  return "/";
}
