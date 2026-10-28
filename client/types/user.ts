export interface StoredUser {
  id: string;
  username: string;
  email: string;
  role: string;
  needsProfileSetup?: boolean;
  token?: string;
  refreshToken?: string;
}

export interface UserLoginResponse extends StoredUser {
  // Add other fields if returned by the API
}
