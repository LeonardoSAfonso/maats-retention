import {
  assertUUIDv7,
  type AcceptOfferRequest,
  type CancellationDetailResponse,
  type CreateCancellationRequest,
  type CreateCancellationResponse,
  type DeclineOfferRequest,
  type MetricsResponse,
  type OfferActionResponse,
  type Plan,
  type Subscriber,
  type Subscription,
  type SubscriptionListResponse,
} from "@repo/contracts";

const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    const message =
      (errorData as { message?: string })?.message ||
      `Erro na requisição HTTP: ${response.status} ${response.statusText}`;
    throw new ApiError(response.status, message, errorData);
  }
  return response.json() as Promise<T>;
}

export async function getSubscriptions(): Promise<SubscriptionListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      cache: "no-store",
    });
    return await handleResponse<SubscriptionListResponse>(response);
  } catch (err) {
    // Retorna lista vazia em caso de falha de conexão na API
    if (err instanceof ApiError) {
      throw err;
    }
    // eslint-disable-next-line no-console
    console.error("Falha ao buscar assinaturas da API:", err);
    return { subscriptions: [] };
  }
}

export async function getSubscriptionById(id: string): Promise<{
  subscription: Subscription;
  subscriber: Subscriber;
  plan: Plan;
}> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
    cache: "no-store",
  });
  return handleResponse(response);
}

export async function createCancellation(
  data: CreateCancellationRequest,
): Promise<CreateCancellationResponse> {
  const response = await fetch(`${API_BASE_URL}/cancellations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse<CreateCancellationResponse>(response);
}

export async function getCancellationById(id: string): Promise<CancellationDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/cancellations/${id}`, {
    cache: "no-store",
  });
  return handleResponse<CancellationDetailResponse>(response);
}

export async function acceptOffer(cancellationId: string): Promise<OfferActionResponse> {
  const body: AcceptOfferRequest = { cancellationId: assertUUIDv7(cancellationId) };
  const response = await fetch(`${API_BASE_URL}/cancellations/${cancellationId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return handleResponse<OfferActionResponse>(response);
}

export async function declineOffer(cancellationId: string): Promise<OfferActionResponse> {
  const body: DeclineOfferRequest = { cancellationId: assertUUIDv7(cancellationId) };
  const response = await fetch(`${API_BASE_URL}/cancellations/${cancellationId}/decline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return handleResponse<OfferActionResponse>(response);
}

export async function getMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/metrics`, {
    cache: "no-store",
  });
  return handleResponse<MetricsResponse>(response);
}
