const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const CSRF_PATH = "/csrf";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let refreshPromise: Promise<boolean> | null = null;
let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

function isUnsafeMethod(method: string): boolean {
  return UNSAFE_METHODS.has(method.toUpperCase());
}

async function fetchCsrfToken(): Promise<string> {
  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}${CSRF_PATH}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Unable to obtain CSRF token (HTTP ${response.status})`);
    }

    const json = await response.json();
    const token = json?.data?.csrfToken ?? json?.csrfToken;

    if (typeof token !== "string" || !token) {
      throw new Error("Invalid CSRF token response");
    }

    csrfToken = token;
    return token;
  })().finally(() => {
    csrfPromise = null;
  });

  return csrfPromise;
}

async function ensureCsrfToken(): Promise<string> {
  return csrfToken ?? fetchCsrfToken();
}

async function request(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (isUnsafeMethod(method)) {
    headers.set("X-CSRF-Token", await ensureCsrfToken());
  }

  const performRequest = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });

  let response = await performRequest();

  if (response.status === 403 && isUnsafeMethod(method)) {
    csrfToken = null;
    headers.set("X-CSRF-Token", await fetchCsrfToken());
    response = await performRequest();
  }

  return response;
}

async function refreshTokenOnce(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshResponse = await request("/users/refresh", {
        method: "POST",
      });
      return refreshResponse.ok;
    } catch (error) {
      console.error("Error during token refresh attempt", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response = await request(path, init);

  if (response.status === 401) {
    const refreshed = await refreshTokenOnce();
    if (refreshed) {
      response = await request(path, init);
    }
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      Array.isArray(errData.message)
        ? errData.message.join(", ")
        : errData.message || `HTTP ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  const json = JSON.parse(text);
  return (json?.data ?? json) as T;
}
