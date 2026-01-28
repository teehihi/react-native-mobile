import React from 'react';
import { View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
}

interface RecommendationSectionProps {
  products: Product[];
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({ products }) => {
  return (
    <View className="px-4 mt-6 pb-28">
      <View className="mb-3 flex-row justify-between items-center">
        <Text className="text-lg font-bold text-gray-900">Có thể bạn sẽ thích</Text>
        <TouchableOpacity className="flex-row items-center">
          <MaterialCommunityIcons name="refresh" size={20} color="#16a34a" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row flex-wrap justify-between">
        {products.slice(0, 6).map((product) => (
          <TouchableOpacity
            key={product.id}
            className="mb-4 bg-white rounded-2xl overflow-hidden shadow-sm"
            style={{ width: CARD_WIDTH }}
            activeOpacity={0.9}
          >
            <View className="relative">
              <Image
                source={{ uri: product.image }}
                style={{ width: CARD_WIDTH, height: 140 }}
                resizeMode="cover"
              />
              <View className="absolute top-2 right-2 bg-green-600 rounded-full px-2 py-1">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="star" size={12} color="white" />
                  <Text className="text-white text-xs font-bold ml-1">{product.rating}</Text>
                </View>
              </View>
            </View>
            <View className="p-3">
              <Text numberOfLines={2} className="font-semibold text-sm mb-1 text-gray-900">
                {product.name}
              </Text>
              <Text className="text-xs text-gray-500 mb-2">0.5 km</Text>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="tag" size={14} color="#16a34a" />
                <Text className="text-xs text-green-700 font-semibold ml-1">
                  Giảm {(product.price * 0.2).toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
