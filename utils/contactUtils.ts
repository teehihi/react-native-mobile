import { Linking, Alert, Platform } from 'react-native';

/**
 * Utility to contact seller via different platforms
 * @param type Platform type: 'zalo' | 'facebook' | 'messenger'
 * @param info Contact ID/Username/Phone
 */
export const contactSeller = async (type: 'zalo' | 'facebook' | 'messenger', info: string) => {
  let url = '';

  switch (type) {
    case 'zalo':
      // Link Zalo thường là zalo.me/số_điện_thoại
      url = `https://zalo.me/${info}`;
      break;
    case 'facebook':
      // Mở app Facebook tới trang cá nhân bằng ID số (chuẩn nhất)
      url = `fb://profile/${info}`;
      break;
    case 'messenger':
      // Mở Messenger chat trực tiếp
      url = `fb-messenger://user-thread/${info}`;
      break;
  }

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // Nếu máy không cài app, mở bằng trình duyệt web làm phương án dự phòng
      let fallbackUrl = '';
      if (type === 'zalo') fallbackUrl = `https://zalo.me/${info}`;
      else fallbackUrl = `https://www.facebook.com/${info}`;
      
      await Linking.openURL(fallbackUrl);
    }
  } catch (error) {
    console.error('Error opening contact URL:', error);
    // Final fallback
    const finalUrl = type === 'zalo' ? `https://zalo.me/${info}` : `https://www.facebook.com/${info}`;
    await Linking.openURL(finalUrl);
  }
};
