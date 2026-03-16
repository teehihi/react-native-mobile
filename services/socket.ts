import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import {
  API_HOST_LOCAL,
  API_HOST_IOS_SIMULATOR,
  API_HOST_ANDROID_EMULATOR,
  API_HOST_REAL_DEVICE,
  API_PORT,
} from '@env';

const getServerUrl = () => {
  const host = Platform.OS === 'android'
    ? (API_HOST_ANDROID_EMULATOR || '10.0.2.2')
    : (API_HOST_REAL_DEVICE || API_HOST_IOS_SIMULATOR || API_HOST_LOCAL || 'localhost');
  const port = API_PORT || '3001';
  return `http://${host}:${port}`;
};

let socket: Socket | null = null;

// Internal listeners registry - tồn tại độc lập với socket instance
const notificationListeners = new Set<(data: any) => void>();

export const connectSocket = (token: string) => {
  // Nếu đã connect với cùng token thì thôi
  if (socket?.connected) return socket;

  // Disconnect cũ nếu có
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(getServerUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  socket.on('connect_error', (e) => {
    console.log('🔌 Socket error:', e.message);
  });

  // Forward tất cả notification events đến listeners đã đăng ký
  socket.on('notification', (data: any) => {
    console.log('🔔 Socket notification received:', data?.title);
    notificationListeners.forEach(cb => cb(data));
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;

// Đăng ký listener - hoạt động kể cả trước khi socket connect
export const onNotification = (callback: (data: any) => void): (() => void) => {
  notificationListeners.add(callback);
  return () => notificationListeners.delete(callback);
};
