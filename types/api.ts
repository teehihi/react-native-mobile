export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  role: 'ADMIN' | 'STAFF' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface Session {
  sessionId: string;
  expiresAt: string;
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface SendOTPRequest {
  email: string;
  fullName?: string;
  username?: string;
}

export interface VerifyRegistrationOTPRequest {
  email: string;
  otpCode: string;
  username: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  user: User;
  tokens: JWTTokens;
  session: Session;
}

export interface RegisterResponse {
  user: User;
  tokens: JWTTokens;
}

export interface SendOTPResponse {
  email: string;
  expiresAt: string;
  expiresIn: string;
}