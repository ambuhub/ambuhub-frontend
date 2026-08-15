import { API_PROXY_PREFIX } from "@/lib/api";

export type DispatchStatus =
  | "searching"
  | "offered"
  | "accepted"
  | "en_route"
  | "arrived"
  | "cancelled"
  | "expired"
  | "no_provider";

export type DispatchRequestDto = {
  id: string;
  status: DispatchStatus;
  pickup: { lat: number; lng: number; address: string | null };
  contactPhone: string | null;
  clientNotes: string | null;
  assignedService?: {
    id: string;
    title: string;
    providerName: string;
  };
  offerExpiresAt?: string;
  ambulanceLocation?: { lat: number; lng: number; updatedAt: string };
  route?: {
    polyline: string;
    distanceMeters: number;
    durationSeconds: number;
  };
  attempts: number;
  createdAt: string;
  acceptedAt?: string | null;
  arrivedAt?: string | null;
};

export type ProviderDispatchService = {
  id: string;
  title: string;
  dispatchEnabled: boolean;
  liveLocationUpdatedAt: string | null;
  dispatchUserId?: string | null;
  hasDispatchAccount?: boolean;
};

export type CreateDispatchPayload = {
  locationSource: "current_location" | "address";
  latitude?: number;
  longitude?: number;
  address?: string;
  notes?: string;
  contactPhone?: string;
};

const ACTIVE_STATUSES: DispatchStatus[] = [
  "searching",
  "offered",
  "accepted",
  "en_route",
];

export function isActiveDispatchStatus(status: DispatchStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function isProviderActiveDispatch(status: DispatchStatus): boolean {
  return status === "accepted" || status === "en_route";
}

export function isClientCancellableStatus(status: DispatchStatus): boolean {
  return (
    (isActiveDispatchStatus(status) && status !== "en_route") ||
    status === "no_provider" ||
    status === "expired"
  );
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  return data.message ?? "Request failed";
}

export async function createDispatchRequest(
  payload: CreateDispatchPayload,
): Promise<DispatchRequestDto> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/requests`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as {
    request?: DispatchRequestDto;
    message?: string;
    requestId?: string;
  };
  if (res.status === 409 && data.requestId) {
    throw new Error(`ACTIVE:${data.requestId}`);
  }
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Could not create dispatch request");
  }
  return data.request;
}

export async function fetchActiveDispatchRequest(): Promise<DispatchRequestDto | null> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/requests/me/active`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    request?: DispatchRequestDto | null;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load active request");
  }
  return data.request ?? null;
}

export async function fetchClientDispatchHistory(): Promise<
  DispatchRequestDto[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/requests/me/history`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    requests?: DispatchRequestDto[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load dispatch history");
  }
  return data.requests ?? [];
}

export async function fetchDispatchRequest(
  requestId: string,
): Promise<DispatchRequestDto> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}`,
    { credentials: "include" },
  );
  const data = (await res.json()) as {
    request?: DispatchRequestDto;
    message?: string;
  };
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Could not load dispatch request");
  }
  return data.request;
}

export async function cancelDispatchRequest(
  requestId: string,
): Promise<DispatchRequestDto> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}/cancel`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  const data = (await res.json()) as {
    request?: DispatchRequestDto;
    message?: string;
  };
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Could not cancel request");
  }
  return data.request;
}

export const DISPATCH_LOCATION_STALE_MS = 5 * 60 * 1000;

export function isProviderLocationFresh(
  updatedAt: string | null | undefined,
): boolean {
  if (!updatedAt) {
    return false;
  }
  return Date.now() - new Date(updatedAt).getTime() < DISPATCH_LOCATION_STALE_MS;
}

/** Provider monitoring — fleet status only. */
export async function fetchProviderDispatchServices(): Promise<
  ProviderDispatchService[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/provider/services`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    services?: ProviderDispatchService[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load dispatch services");
  }
  return data.services ?? [];
}

/** Crew — linked service for duty / GPS. */
export async function fetchCrewDispatchServices(): Promise<
  ProviderDispatchService[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/crew/services`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    services?: ProviderDispatchService[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load dispatch services");
  }
  return data.services ?? [];
}

export async function setServiceDispatchEnabled(
  serviceId: string,
  dispatchEnabled: boolean,
  location?: { latitude: number; longitude: number },
): Promise<void> {
  const body: Record<string, unknown> = { dispatchEnabled };
  if (location) {
    body.latitude = location.latitude;
    body.longitude = location.longitude;
  }

  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/services/${encodeURIComponent(serviceId)}/dispatch`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

export async function updateServiceLiveLocation(
  serviceId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/services/${encodeURIComponent(serviceId)}/location`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude, longitude }),
    },
  );
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

/** @deprecated Provider monitoring no longer receives offers; use fetchCrewOffer. */
export async function fetchProviderOffer(): Promise<DispatchRequestDto | null> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/provider/offer`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    offer?: DispatchRequestDto | null;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load offer");
  }
  return data.offer ?? null;
}

export async function fetchCrewOffer(): Promise<DispatchRequestDto | null> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/crew/offer`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    offer?: DispatchRequestDto | null;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load offer");
  }
  return data.offer ?? null;
}

export async function fetchProviderDispatchRequests(): Promise<
  DispatchRequestDto[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/provider/requests`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    requests?: DispatchRequestDto[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load dispatch requests");
  }
  return data.requests ?? [];
}

export async function fetchCrewDispatchRequests(): Promise<
  DispatchRequestDto[]
> {
  const res = await fetch(`${API_PROXY_PREFIX}/dispatch/crew/requests`, {
    credentials: "include",
  });
  const data = (await res.json()) as {
    requests?: DispatchRequestDto[];
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message ?? "Could not load dispatch requests");
  }
  return data.requests ?? [];
}

export async function acceptDispatchOffer(
  requestId: string,
): Promise<DispatchRequestDto> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}/accept`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const data = (await res.json()) as {
    request?: DispatchRequestDto;
    message?: string;
  };
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Could not accept offer");
  }
  return data.request;
}

export async function rejectDispatchOffer(
  requestId: string,
): Promise<DispatchRequestDto> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}/reject`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const data = (await res.json()) as {
    request?: DispatchRequestDto;
    message?: string;
  };
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Could not reject offer");
  }
  return data.request;
}

export async function markDispatchArrived(
  requestId: string,
): Promise<DispatchRequestDto> {
  const res = await fetch(
    `${API_PROXY_PREFIX}/dispatch/requests/${encodeURIComponent(requestId)}/arrived`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  const data = (await res.json()) as {
    request?: DispatchRequestDto;
    message?: string;
  };
  if (!res.ok || !data.request) {
    throw new Error(data.message ?? "Could not mark arrival");
  }
  return data.request;
}

export function dispatchStatusLabel(status: DispatchStatus): string {
  switch (status) {
    case "searching":
      return "Searching for nearby ambulances…";
    case "offered":
      return "Waiting for ambulance to accept…";
    case "accepted":
      return "Ambulance accepted — preparing route";
    case "en_route":
      return "Ambulance en route";
    case "arrived":
      return "Ambulance has arrived";
    case "cancelled":
      return "Request cancelled";
    case "no_provider":
      return "No ambulance available nearby";
    case "expired":
      return "Request expired";
    default:
      return status;
  }
}
