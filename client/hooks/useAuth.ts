"use client";
import { useState, useEffect, useCallback } from "react";
import { userApi } from "@app/lib/api";
import { StoredUser } from "@app/types";

export const useAuth = () => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") {
      setIsAuthLoading(false);
      return null;
    }
    
    setIsAuthLoading(true);
    const stored = window.localStorage.getItem("app_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let currentUser: StoredUser | null = null;
        
        if (parsed && parsed.data && parsed.data.username) {
          currentUser = parsed.data;
        } else if (parsed && parsed.username) {
          currentUser = parsed as StoredUser;
        }

        if (currentUser) {
          setUser(currentUser);
          setIsAuthLoading(false);
          return currentUser;
        } else {
          window.localStorage.removeItem("app_user");
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        window.localStorage.removeItem("app_user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsAuthLoading(false);
    return null;
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<StoredUser | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const apiResponse: any = await userApi.login(username, password);

      let loggedInUser: StoredUser | null = null;
      if (apiResponse && apiResponse.data && apiResponse.data.username) {
        loggedInUser = apiResponse.data;
      } else if (apiResponse && apiResponse.username) {
        loggedInUser = apiResponse as StoredUser;
      }

      if (loggedInUser) {
        // We don't store tokens in localStorage anymore, only the user profile
        const { token, refreshToken, ...userProfile } = loggedInUser;
        window.localStorage.setItem("app_user", JSON.stringify(userProfile));
        setUser(userProfile);
        return userProfile;
      } else {
        throw new Error("Login failed: Unexpected response format.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; password?: string }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await userApi.register(userData);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } catch (err) {
      console.error("Error during logout", err);
    } finally {
      window.localStorage.removeItem("app_user");
      setUser(null);
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await userApi.refresh();
      return response.token;
    } catch (err) {
      console.error("Failed to refresh access token", err);
      await logout();
      return null;
    }
  };

  return {
    user,
    isLoading,
    isAuthLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    refreshAccessToken,
  };
};
