import { API_PROXY_PREFIX } from "@/lib/api";

export type DispatchAccountDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  isDisabled: boolean;
  assignedServiceId: string;
  listingTitle: string;
  dispatchEnabled: boolean;
  liveLocationUpdatedAt: string | null;
  isAvailable: boolean;
  activeRequestId: string | null;
  activeRequestStatus: string | null;
  lastAttemptOutcome: string | null;
};

export type CreateDispatchAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  serviceId: string;
};

export type AvailableDispatchListing = {
  id: string;
  title: string;
};

function proxyUrl(path: string): string {
  const base = API_PROXY_PREFIX.replace(/\/$/, "");
  const p = path.replace(/^\//, "");
  return `${base}/${p}`;
}

export async function fetchDispatchAccounts(): Promise<DispatchAccountDto[]> {
  const res = await fetch(proxyUrl("provider/dispatch-accounts"), {
    credentials: "include",
  });
  const data = (await res.json()) as {
    accounts?: DispatchAccountDto[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load dispatch accounts");
  }
  return data.accounts ?? [];
}

export async function fetchAvailableDispatchListings(): Promise<
  AvailableDispatchListing[]
> {
  const res = await fetch(
    proxyUrl("provider/dispatch-accounts/available-listings"),
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    services?: AvailableDispatchListing[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load available listings");
  }
  return data.services ?? [];
}

export async function createDispatchAccount(
  input: CreateDispatchAccountInput,
): Promise<DispatchAccountDto> {
  const res = await fetch(proxyUrl("provider/dispatch-accounts"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as {
    account?: DispatchAccountDto;
    message?: string;
  };
  if (!res.ok || !data.account) {
    throw new Error(data.message ?? "Could not create dispatch account");
  }
  return data.account;
}

export async function setDispatchAccountDisabled(
  id: string,
  isDisabled: boolean,
): Promise<DispatchAccountDto> {
  const res = await fetch(
    proxyUrl(`provider/dispatch-accounts/${encodeURIComponent(id)}`),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDisabled }),
    },
  );
  const data = (await res.json()) as {
    account?: DispatchAccountDto;
    message?: string;
  };
  if (!res.ok || !data.account) {
    throw new Error(data.message ?? "Could not update account");
  }
  return data.account;
}
