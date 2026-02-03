export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: 'ADMIN' | 'STAFF' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface Session {
  sessionId: string;
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: {
    ADMIN: number;
    STAFF: number;
    USER: number;
  };
  newUsersToday: number;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
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

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
  otpCode?: string;
}

export interface UpdatePhoneRequest {
  newPhone: string;
  otpCode?: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  rating: number;
  soldCount: number;
  isActive: boolean;
  createdAt: string;
  discountPercentage?: number;
}

export interface Category {
  name: string;
  productCount: number;
}

export interface ProductFilters {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}