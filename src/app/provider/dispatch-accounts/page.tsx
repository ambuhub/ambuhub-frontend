import { redirect } from "next/navigation";

export default function ProviderDispatchAccountsRedirectPage() {
  redirect("/provider/dispatch?tab=create");
}
