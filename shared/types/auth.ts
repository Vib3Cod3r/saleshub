export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  mobile?: string;
  avatar?: string;
  timezone?: string;
  locale?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  roleId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  roleId: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}
