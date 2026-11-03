"use client";
import { useState, useCallback, useSyncExternalStore } from "react";
import { userApi } from "@app/lib/api";
import { StoredUser } from "@app/types";

const STORAGE_KEY = "app_user";

let cachedUser: StoredUser | null = null;
let hasLoaded = false;
const listeners = new Set<() => void>();

function parseStoredUser(raw: string | null): StoredUser | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as
      | ({ data?: StoredUser } & Partial<StoredUser>)
      | null;

    if (parsed?.data?.username) {
      return parsed.data;
    }
    if (parsed?.username) {
      return parsed as StoredUser;
    }
  } catch (e) {
    console.error("Failed to parse stored user", e);
  }

  return null;
}

function loadUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  if (!hasLoaded) {
    cachedUser = parseStoredUser(window.localStorage.getItem(STORAGE_KEY));
    hasLoaded = true;
  }

  return cachedUser;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function setStoredUser(user: StoredUser | null) {
  cachedUser = user;
  hasLoaded = true;

  if (typeof window !== "undefined") {
    if (user) {
      const profile: Record<string, unknown> = { ...user };
      delete profile.token;
      delete profile.refreshToken;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => listeners.delete(listener);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      hasLoaded = false;
      cachedUser = null;
      emitChange();
    }
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): StoredUser | null {
  return loadUser();
}

function getServerSnapshot(): StoredUser | null {
  return null;
}

const subscribeHydration = () => () => {};

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message || e?.message || fallback;
}

export const useAuth = () => {
  const user = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback((): StoredUser | null => loadUser(), []);

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<StoredUser | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const loggedInUser = await userApi.login(username, password);

        if (!loggedInUser?.username) {
          throw new Error("Login failed: Unexpected response format.");
        }

        setStoredUser(loggedInUser);
        return loggedInUser;
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Login failed. Please try again."));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async (userData: {
      username: string;
      email: string;
      password?: string;
    }): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await userApi.register(userData);
        return true;
      } catch (err: unknown) {
        setError(
          getErrorMessage(err, "Registration failed. Please try again."),
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await userApi.logout();
    } catch (err) {
      console.error("Error during logout", err);
    } finally {
      setStoredUser(null);
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await userApi.refresh();
      return response.token;
    } catch (err) {
      console.error("Failed to refresh access token", err);
      await logout();
      return null;
    }
  }, [logout]);

  return {
    user,
    isLoading,
    isAuthLoading: !isHydrated,
    error,
    login,
    register,
    logout,
    checkAuth,
    refreshAccessToken,
  };
};
