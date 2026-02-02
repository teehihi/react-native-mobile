import React from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../types/api';
import { getProductImage } from '../services/api';
import { stripHtmlTags } from '../utils/textUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductSectionProps {
  title: string;
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({ title, products, onProductPress }) => {
  return (
    <View className="mt-6">
      <View className="px-4 mb-3 flex-row justify-between items-center">
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
        <TouchableOpacity className="flex-row items-center">
          <MaterialCommunityIcons name="chevron-right" size={24} color="#16a34a" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {products.slice(0, 5).map((product) => (
          <TouchableOpacity
            key={product.id}
            className="mr-3 bg-white rounded-2xl overflow-hidden shadow-sm"
            style={{ width: CARD_WIDTH }}
            activeOpacity={0.9}
            onPress={() => onProductPress?.(product)}
          >
            <View className="relative">
              <Image
                source={{ uri: getProductImage(product.imageUrl, product.category, product.name, product.id) }}
                style={{ width: CARD_WIDTH, height: 140 }}
                resizeMode="cover"
              />
              <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">-20%</Text>
              </View>
            </View>
            <View className="p-3">
              <Text numberOfLines={2} className="font-semibold text-sm mb-1 text-gray-900">
                {product.name}
              </Text>
              <Text className="text-xs text-gray-500 mb-2">{product.category}</Text>
              <Text className="text-xs text-gray-400 mb-2" numberOfLines={1}>
                {stripHtmlTags(product.description)}
              </Text>
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="tag" size={14} color="#16a34a" />
                <Text className="text-xs text-green-700 font-semibold ml-1">
                  Giảm {(product.price * 0.2).toLocaleString('vi-VN')}đ
                </Text>
              </View>
              <TouchableOpacity 
                className="bg-green-600 rounded-lg py-2 px-3 flex-row items-center justify-center"
                onPress={(e) => {
                  e.stopPropagation();
                  // TODO: Add to cart logic
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="plus" size={14} color="white" />
                <Text className="text-white text-xs font-semibold ml-1">Thêm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
