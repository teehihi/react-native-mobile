import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const PromoBanner: React.FC = () => {
  return (
    <View className="px-4 mt-6">
      <TouchableOpacity 
        className="bg-green-700 rounded-2xl overflow-hidden"
        activeOpacity={0.9}
      >
        <View className="p-6 flex-row items-center justify-between">
          <View className="flex-1">
            <View className="bg-red-500 rounded-full px-3 py-1 self-start mb-2">
              <Text className="text-white text-xs font-bold">THƯƠNG HIỆU TOP</Text>
            </View>
            <Text className="text-white font-bold text-xl mb-1">Lên Deal</Text>
            <Text className="text-white font-bold text-xl mb-2">Đỉnh Chóp</Text>
            <Text className="text-white/90 text-xs">Giảm đến 50%</Text>
          </View>
          <View className="w-32 h-32 bg-white/10 rounded-xl items-center justify-center">
            <MaterialCommunityIcons name="gift" size={60} color="rgba(255,255,255,0.3)" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
