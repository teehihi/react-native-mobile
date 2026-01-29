import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '../types/api';
import { API_HOST_REAL_DEVICE, API_PORT } from '@env';
import { LinearGradient } from 'expo-linear-gradient';


interface HomepageHeaderProps {
  user: User | null;
  onAvatarPress: () => void;
}

export const HomepageHeader: React.FC<HomepageHeaderProps> = ({ user, onAvatarPress }) => {
  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      const host = API_HOST_REAL_DEVICE || 'localhost';
      const port = API_PORT || '3001';
      return `http://${host}:${port}${user.avatarUrl}`;
    }
    return null;
  };

  return (
    <LinearGradient
      colors={['#6FD39B', '#63CBB0', '#5BC3C8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height: 200 }}  
    >
      <View className="px-4 pt-16 pb-16">
        {/* Top Row: QR, Search, Icons */}
        <View className="flex-row items-center mb-3">
          {/* QR Scanner */}
          <TouchableOpacity 
            className="w-11 h-11 bg-white/20 rounded-xl items-center justify-center mr-3"
            activeOpacity={0.7}
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="white" />
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity 
            className="flex-1 bg-white rounded-2xl flex-row items-center px-4 py-3"
            activeOpacity={0.8}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <MaterialCommunityIcons name="magnify" size={22} color="#9ca3af" />
            <Text className="ml-3 text-gray-500 text-sm font-medium">Tìm món</Text>
          </TouchableOpacity>

          {/* Rewards Icon */}
          <TouchableOpacity 
            className="w-11 h-11 bg-yellow-400 rounded-full items-center justify-center ml-3"
            activeOpacity={0.7}
            style={{
              shadowColor: '#fbbf24',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <MaterialCommunityIcons name="gift" size={22} color="white" />
          </TouchableOpacity>

          {/* User Avatar */}
          <TouchableOpacity 
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-white ml-2"
            onPress={onAvatarPress}
            activeOpacity={0.7}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            {getAvatarUrl() ? (
              <Image 
                source={{ uri: getAvatarUrl()! }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-white items-center justify-center">
                <MaterialCommunityIcons name="account" size={22} color="#16a34a" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* User Greeting */}
        <View className="px-1">
          <Text className="text-white/90 text-sm mb-0.5">Xin chào,</Text>
          <Text className="text-white text-lg font-bold">
            {user?.fullName || user?.username || 'Khách'}
          </Text>
        </View>
      </View>
      
    </LinearGradient>
  );
};
