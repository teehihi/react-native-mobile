import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  API_HOST_LOCAL,
  API_HOST_IOS_SIMULATOR,
  API_HOST_ANDROID_EMULATOR,
  API_HOST_REAL_DEVICE,
  API_PORT,
  DEBUG_API,
} from '@env';
import {
  LoginRequest, 
  RegisterRequest, 
  SendOTPRequest,
  VerifyRegistrationOTPRequest,
  ResetPasswordRequest,
  ApiResponse, 
  LoginResponse,
  RegisterResponse,
  SendOTPResponse,
  User,
  JWTTokens,
  UserStats,
  SessionStats,
  Session,
  Product,
  ProductFilters,
  ProductsResponse,
} from '../types/api';

// API Configuration từ environment variables
const getApiHost = () => {
  if (Platform.OS === 'android') {
    return API_HOST_ANDROID_EMULATOR || '10.0.2.2';
  }
  
  // Cho iOS: ưu tiên real device, fallback về simulator
  return API_HOST_REAL_DEVICE || API_HOST_IOS_SIMULATOR || API_HOST_LOCAL || 'localhost';
};

const API_HOST = getApiHost();
const PORT = API_PORT || '3001';
const API_BASE_URL = `http://${API_HOST}:${PORT}/api`;
const API_SERVER_URL = `http://${API_HOST}:${PORT}`;

// Helper function to format image URLs
export const formatImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative path, prepend server URL
  if (imageUrl.startsWith('/')) {
    return `${API_SERVER_URL}${imageUrl}`;
  }
  
  // If no leading slash, add it
  return `${API_SERVER_URL}/${imageUrl}`;
};

// Helper function to get image with fallback to placeholder
export const getProductImage = (imageUrl: string | null | undefined, category: string, productName?: string, productId?: number): string => {
  // For development, always use placeholder since images don't exist
  // In production, you would try the real URL first
  
  if (productId) {
    // Use consistent placeholder based on product ID
    const seed = productId.toString();
    return `https://picsum.photos/seed/${seed}/400/300`;
  }
  
  // Fallback to category-based placeholder
  const categoryImages: { [key: string]: string } = {
    'Bánh Kẹo': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    'Đặc Sản Miền Bắc': 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=300&fit=crop',
    'Đặc Sản Miền Trung': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'Đặc Sản Miền Nam': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    'Nem Chua': 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=300&fit=crop',
  };

  // Try to find category match
  for (const [cat, url] of Object.entries(categoryImages)) {
    if (category.includes(cat)) {
      return url;
    }
  }

  // Default Vietnamese food image
  return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
};

// Debug logging
if (DEBUG_API === 'true') {
  console.log('🔧 API Configuration:');
  console.log('Platform:', Platform.OS);
  console.log('API Host:', API_HOST);
  console.log('API Base URL:', API_BASE_URL);
}

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Tăng timeout cho iOS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor để log requests & Inject Token (Layer 2: Authentication)
apiClient.interceptors.request.use(
  async (config) => {
    // Only log in debug mode
    if (DEBUG_API === 'true') {
      console.log(`🚀 API: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Inject Token
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error: any) {
      console.error('Token error:', error?.message || 'Token access failed');
    }
    
    return config;
  },
  (error: any) => {
    console.error('❌ Request Error:', error?.message || 'Request failed');
    return Promise.reject(error);
  }
);

// Add response interceptor để log responses & Handle Errors (Layer 4: Rate Limiting, Layer 3: Authz)
apiClient.interceptors.response.use(
  (response) => {
    // Only log in debug mode
    if (DEBUG_API === 'true') {
      console.log(`✅ API: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error(`❌ API Error: ${status || 'Network'} ${url}`);

    if (status === 401) {
      console.log('🔒 Unauthorized - Token expired');
    }

    if (status === 403) {
      console.log('🚫 Forbidden - No permission');
    }

    if (status === 429) {
      console.warn('⏳ Too Many Requests');
    }

    // Only log detailed error in debug mode
    if (DEBUG_API === 'true' && error.response?.data) {
      console.error('Error details:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  SESSION_ID: 'sessionId',
  USER_DATA: 'userData',
};

export class ApiService {
  // Send OTP for registration
  static async sendRegistrationOTP(data: SendOTPRequest): Promise<ApiResponse<SendOTPResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/auth/send-registration-otp', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Verify OTP and complete registration
  static async verifyRegistrationOTP(data: VerifyRegistrationOTPRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/verify-registration-otp', data);
      
      if (response.data.success && response.data.data) {
        // Lưu tokens và user data
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.data.tokens.accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.tokens.refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Send OTP for password reset
  static async sendPasswordResetOTP(data: SendOTPRequest): Promise<ApiResponse<SendOTPResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/auth/send-password-reset-otp', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Reset password with OTP
  static async resetPasswordWithOTP(data: ResetPasswordRequest): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/reset-password-otp', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Register user (legacy - without OTP)
  static async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Login user
  static async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
      
      if (response.data.success && response.data.data) {
        // Lưu tokens, session và user data
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.data.tokens.accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.tokens.refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, response.data.data.session.sessionId);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return !!accessToken;
    } catch (error) {
      return false;
    }
  }

  // Check session (legacy)
  static async checkSession(): Promise<boolean> {
    try {
      const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!sessionId) return false;

      const response = await apiClient.post('/auth/check-session', { sessionId });
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (sessionId) {
        await apiClient.post('/auth/logout', { sessionId });
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Xóa tất cả dữ liệu local
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Get access token
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  }

  // Get session ID (legacy)
  static async getSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
    } catch (error) {
      return null;
    }
  }


  // Delete user
  static async deleteUser(id: number | string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Toggle user status (Active/Inactive)
  static async toggleUserStatus(id: number | string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Search users
  static async searchUsers(query: string, limit: number = 20): Promise<ApiResponse<User[]>> {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>('/users/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Get user stats
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Get users by role
  static async getUsersByRole(role: string, limit: number = 50): Promise<ApiResponse<{users: User[], total: number}>> {
    try {
      const response = await apiClient.get<ApiResponse<{users: User[], total: number}>>(`/users/role/${role}`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // --- Session APIs ---

  // Get all sessions
  static async getAllSessions(page: number = 1, limit: number = 50): Promise<ApiResponse<{sessions: Session[], pagination: any, stats: SessionStats}>> {
    try {
      const response = await apiClient.get<ApiResponse<{sessions: Session[], pagination: any, stats: SessionStats}>>('/sessions', {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Get session stats
  static async getSessionStats(): Promise<ApiResponse<{stats: SessionStats}>> {
    try {
      const response = await apiClient.get<ApiResponse<{stats: SessionStats}>>('/sessions/stats');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Get sessions by IP
  static async getSessionsByIp(ip: string, limit: number = 20): Promise<ApiResponse<{sessions: Session[], total: number}>> {
    try {
      const response = await apiClient.get<ApiResponse<{sessions: Session[], total: number}>>(`/sessions/ip/${ip}`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Cleanup expired sessions
  static async cleanupExpiredSessions(): Promise<ApiResponse<{deletedSessions: number}>> {
    try {
      const response = await apiClient.delete<ApiResponse<{deletedSessions: number}>>('/sessions/cleanup');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Delete specific session
  static async deleteSession(sessionId: string): Promise<ApiResponse<{sessionId: string}>> {
    try {
      const response = await apiClient.delete<ApiResponse<{sessionId: string}>>(`/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // --- Profile Management APIs ---

  // Get current user profile
  static async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Update basic profile info
  static async updateProfile(data: { fullName: string; phoneNumber?: string }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.patch<ApiResponse<{ user: User }>>('/profile', data);
      
      // Update stored user data
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Upload avatar
  static async uploadAvatar(imageUri: string): Promise<ApiResponse<{ user: User; avatarUrl: string }>> {
    try {
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore - FormData append with file object
      formData.append('avatar', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      const response = await apiClient.post<ApiResponse<{ user: User; avatarUrl: string }>>(
        '/profile/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update stored user data
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/profile/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Send OTP for password change
  static async sendPasswordChangeOTP(currentPassword: string): Promise<ApiResponse<SendOTPResponse & { otpToken: string }>> {
    try {
      const response = await apiClient.post<ApiResponse<SendOTPResponse & { otpToken: string }>>('/profile/password/send-otp', {
        currentPassword,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Verify OTP and change password
  static async verifyPasswordChangeOTP(currentPassword: string, newPassword: string, otpCode: string, otpToken: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/profile/password/verify-otp', {
        currentPassword,
        newPassword,
        otpCode,
        otpToken,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Send OTP for email update
  static async sendEmailUpdateOTP(newEmail: string): Promise<ApiResponse<SendOTPResponse & { otpToken: string }>> {
    try {
      const response = await apiClient.post<ApiResponse<SendOTPResponse & { otpToken: string }>>('/profile/email/send-otp', {
        newEmail,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Verify OTP and update email
  static async verifyEmailUpdate(newEmail: string, otpCode: string, otpToken: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User }>>('/profile/email/verify-otp', {
        newEmail,
        otpCode,
        otpToken,
      });

      // Update stored user data
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Send OTP for phone update
  static async sendPhoneUpdateOTP(newPhone: string): Promise<ApiResponse<SendOTPResponse & { otpToken: string }>> {
    try {
      const response = await apiClient.post<ApiResponse<SendOTPResponse & { otpToken: string }>>('/profile/phone/send-otp', {
        newPhone,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Verify OTP and update phone
  static async verifyPhoneUpdate(newPhone: string, otpCode: string, otpToken: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User }>>('/profile/phone/verify-otp', {
        newPhone,
        otpCode,
        otpToken,
      });

      // Update stored user data
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // --- Product APIs ---

  // Get products with filters and pagination
  static async getProducts(params?: ProductFilters): Promise<ApiResponse<Product[]> & { pagination?: any }> {
    try {
      const response = await apiClient.get<ApiResponse<Product[]> & { pagination?: any }>('/products', { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Get product by ID
  static async getProductById(id: string | number): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }

  // Get product categories
  static async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get<ApiResponse<string[]>>('/products/categories');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Lỗi kết nối mạng. Vui lòng thử lại.',
      };
    }
  }
}
