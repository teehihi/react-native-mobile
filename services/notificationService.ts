import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { onNotification } from './socket';
import { useNotificationStore } from '../store/notificationStore';

// Cấu hình hiển thị notification khi app đang foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Xin quyền notification
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'DacSanViet',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#16a34a',
      showBadge: true,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Hiển thị local notification
export const showLocalNotification = async (title: string, body: string, data?: any) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        color: '#16a34a',
        // Android: dùng adaptive icon của app (dacsanviet logo)
        ...(Platform.OS === 'android' && {
          icon: './assets/dacsanvietLogo.webp',
        }),
      },
      trigger: null,
    });
  } catch (e) {
    console.log('Local notification error:', e);
  }
};

// Lắng nghe socket notification và hiển thị local push
export const setupSocketNotificationListener = (): (() => void) => {
  const unsub = onNotification(async (notif: any) => {
    // Tăng badge trong store
    useNotificationStore.getState().increment();
    // Hiển thị push notification lên máy
    await showLocalNotification(
      notif.title || 'Thông báo mới',
      notif.body || '',
      notif.data,
    );
  });
  return unsub || (() => {});
};
