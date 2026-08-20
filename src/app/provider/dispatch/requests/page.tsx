import { redirect } from "next/navigation";

export default function ProviderDispatchRequestsRedirectPage() {
  redirect("/provider/dispatch?tab=requests");
}
