import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '../types/api';

interface UserProfileModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  user,
  onClose,
  onLogout,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          className="bg-white rounded-3xl mx-6 w-80"
          activeOpacity={1}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View className="bg-green-600 rounded-t-3xl p-6 items-center">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-3">
              <MaterialCommunityIcons name="account" size={40} color="#16a34a" />
            </View>
            <Text className="text-white text-xl font-bold mb-1">
              {user?.fullName || user?.username || 'Khách'}
            </Text>
            <Text className="text-white/80 text-sm">
              {user?.email || 'Chưa có email'}
            </Text>
          </View>

          {/* User Info */}
          <View className="p-6">
            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="account-outline" size={20} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-2 mb-1">Tên đăng nhập</Text>
              </View>
              <Text className="text-gray-900 text-base font-medium ml-7">
                {user?.username || 'N/A'}
              </Text>
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="phone-outline" size={20} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-2 mb-1">Số điện thoại</Text>
              </View>
              <Text className="text-gray-900 text-base font-medium ml-7">
                {user?.phoneNumber || 'Chưa cập nhật'}
              </Text>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="shield-check-outline" size={20} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-2 mb-1">Vai trò</Text>
              </View>
              <Text className="text-gray-900 text-base font-medium ml-7 capitalize">
                {user?.role || 'User'}
              </Text>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              className="bg-red-500 rounded-2xl py-4 items-center mb-3"
              onPress={onLogout}
              activeOpacity={0.8}
              style={{
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="logout" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Đăng Xuất</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-100 rounded-2xl py-4 items-center"
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold text-base">Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
