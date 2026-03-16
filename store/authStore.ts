import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../services/api';
import { User } from '../types/api';
import { RealmService } from '../services/realm';
import { connectSocket, disconnectSocket } from '../services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (token: string, user: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      await RealmService.saveUser(user);
      connectSocket(token);
      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Login error', error);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await RealmService.clearUserData();
      disconnectSocket();
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Logout error', error);
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const user = await RealmService.getUser();
      
      if (token && user) {
        connectSocket(token);
        set({ 
          token, 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Check auth error', error);
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },
}));
