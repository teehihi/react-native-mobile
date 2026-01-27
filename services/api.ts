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
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Inject Token
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor để log responses & Handle Errors (Layer 4: Rate Limiting, Layer 3: Authz)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error(`❌ API Error: ${status || 'Network Error'} ${url}`);

    if (status === 401) {
      // Layer 2: Authentication Failure - Token Invalid/Expired
      console.log('🔒 401 Unauthorized - Logout user or Refresh token');
      // Logic to logout or refresh token could go here
      // For now, we might rely on the sensitive UI to redirect to login
    }

    if (status === 403) {
      // Layer 3: Authorization Failure - Forbidden
      console.log('🚫 403 Forbidden - User does not have permission');
    }

    if (status === 429) {
      // Layer 4: Rate Limiting
      console.warn('⏳ 429 Too Many Requests - Please look at Rate Limit headers');
      // Ideally, show a toast or alert to the user
    }

    if (error.response?.data) {
      console.error('❌ Error Response Data:', JSON.stringify(error.response.data, null, 2));
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
}
