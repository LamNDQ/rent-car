const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    try {
      // Attempt to refresh the token
      // The refreshToken cookie will be sent automatically because of credentials: 'include'
      const refreshResponse = await fetch(`${API_BASE_URL}/users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // If successful, the new accessToken cookie is already set by the server
        // Retry the original request
        response = await fetch(`${API_BASE_URL}${path}`, {
          ...init,
          headers,
          credentials: 'include',
        });
      } else {
        // Refresh token failed, we can't do much here, but the error will be handled below
      }
    } catch (error) {
      console.error("Error during token refresh attempt", error);
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

  const json = await response.json();
  return (json?.data ?? json) as T;
}
