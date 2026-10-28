import { StoredUser } from "@app/types";
import { apiClient } from "./apiClient";

export const userApi = {
  login: async (username: string, password: string): Promise<StoredUser> => {
    return apiClient<StoredUser>(`/users/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  refresh: async (): Promise<{ token: string }> => {
    return apiClient<{ token: string }>(`/users/refresh`, {
      method: "POST",
    });
  },

  logout: async (): Promise<void> => {
    await apiClient<void>(`/users/logout`, {
      method: "POST",
    });
  },

  getMe: async (token?: string): Promise<StoredUser> => {
    return apiClient<StoredUser>(`/users/me`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  register: async (userData: { username: string; email: string; password?: string }): Promise<void> => {
    await apiClient<void>(`/users`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  findAll: async (): Promise<StoredUser[]> => {
    return apiClient<StoredUser[]>(`/users`, {
      method: "GET",
    });
  },

  update: async (id: string, updateData: Partial<StoredUser>): Promise<StoredUser> => {
    return apiClient<StoredUser>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },
};

