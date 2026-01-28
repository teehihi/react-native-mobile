import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ServiceItem {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface ServiceGridProps {
  services: ServiceItem[];
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services }) => {
  return (
    <View className="bg-white mx-4 rounded-2xl p-4 shadow-md" style={{ marginTop: -35 }}>
      <View className="flex-row flex-wrap">
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            className="items-center mb-4"
            style={{ width: '25%' }}
            activeOpacity={0.7}
          >
            <View 
              className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: `${service.color}15` }}
            >
              <MaterialCommunityIcons name={service.icon as any} size={28} color={service.color} />
            </View>
            <Text className="text-xs text-center text-gray-700 font-medium" numberOfLines={2}>
              {service.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
