export interface StoredUser {
  id: string;
  username: string;
  email: string;
  role: string;
  needsProfileSetup?: boolean;
  token?: string;
  refreshToken?: string;
}

export type UserLoginResponse = StoredUser;
