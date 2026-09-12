import { API_PROXY_PREFIX } from "@/lib/api";

export const CONTACT_SUBJECT_OPTIONS = [
  {
    key: "listing_or_booking_help",
    label: "Listing or booking help",
  },
  {
    key: "become_service_provider",
    label: "Become a service provider",
  },
  {
    key: "payment_or_billing",
    label: "Payment or billing issue",
  },
  {
    key: "partnership_or_media",
    label: "Partnership or media inquiry",
  },
  {
    key: "other",
    label: "Other",
  },
] as const;

export type ContactSubjectKey = (typeof CONTACT_SUBJECT_OPTIONS)[number]["key"];

export type SubmitContactMessageInput = {
  name: string;
  email: string;
  phone: string;
  subjectKey: ContactSubjectKey;
  otherSubject?: string;
  message: string;
};

export async function submitContactMessage(
  input: SubmitContactMessageInput,
): Promise<void> {
  const res = await fetch(`${API_PROXY_PREFIX}/contact-messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      phone: input.phone,
      subjectKey: input.subjectKey,
      otherSubject: input.otherSubject,
      message: input.message,
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? "Could not send your message. Please try again.");
  }
}
