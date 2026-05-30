import { API_PROXY_PREFIX } from "@/lib/api";

export const CONCIERGE_SOMETHING_ELSE_SLUG = "something-else";
export const CONCIERGE_SOMETHING_ELSE_LABEL = "Something else";

export type ServiceCategoryOption = {
  id: string;
  name: string;
  slug: string;
  departments: { name: string; slug: string; order: number }[];
};

export type ConciergeRequestPayload = {
  name: string;
  phone: string;
  email: string;
  countryCode: string;
  categorySlug: string;
  departmentSlug: string;
  description: string;
};

export type ConciergeRequestResult = {
  id: string;
  name: string;
  phone: string;
  email: string;
  countryCode: string;
  categorySlug: string;
  categoryName: string;
  departmentSlug: string;
  departmentName: string;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: string;
};

export async function fetchServiceCategoryOptions(): Promise<
  ServiceCategoryOption[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/service-categories`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    serviceCategories?: ServiceCategoryOption[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load service categories.");
  }
  return data.serviceCategories ?? [];
}

export async function submitConciergeRequest(
  payload: ConciergeRequestPayload,
): Promise<ConciergeRequestResult> {
  const res = await fetch(`${API_PROXY_PREFIX}/concierge/requests`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as {
    request?: ConciergeRequestResult;
    message?: string;
  };

  if (res.status === 401) {
    throw new Error("Sign in to submit a concierge request.");
  }
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Could not submit request.");
  }

  return data.request;
}
