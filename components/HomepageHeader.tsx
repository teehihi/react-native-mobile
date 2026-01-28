import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '../types/api';

interface HomepageHeaderProps {
  user: User | null;
  onAvatarPress: () => void;
}

export const HomepageHeader: React.FC<HomepageHeaderProps> = ({ user, onAvatarPress }) => {
  return (
    <View className="bg-green-600 px-4 pt-16 pb-16">
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
          className="w-11 h-11 bg-white rounded-full items-center justify-center ml-2"
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
          <MaterialCommunityIcons name="account" size={22} color="#16a34a" />
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
  );
};
