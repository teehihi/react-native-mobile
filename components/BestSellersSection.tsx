import React from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions, Image, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../types/api';
import { getProductImage } from '../services/api';
import { stripHtmlTags } from '../utils/textUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2.2; // Slightly smaller for better fit

interface BestSellersSectionProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ 
  products, 
  onProductPress 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <View className="mt-6">
      <View className="px-4 mb-3 flex-row justify-between items-center">
        <Text className="text-lg font-bold text-gray-900">🔥 Sản Phẩm HOT</Text>
        <TouchableOpacity className="flex-row items-center">
          <MaterialCommunityIcons name="chevron-right" size={24} color="#16a34a" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {products.map((product, index) => (
          <TouchableOpacity
            key={product.id}
            className="mr-3 bg-white rounded-2xl overflow-hidden shadow-lg"
            style={[
              { 
                width: CARD_WIDTH, 
                height: 300,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                borderRadius: 16, // Match rounded-2xl (16px)
                elevation: 8, // For Android
              }
            ]}
            activeOpacity={0.9}
            onPress={() => onProductPress?.(product)}
          >
            <View className="relative">
              <Image
                source={{ uri: getProductImage(product.imageUrl, product.category, product.name, product.id) }}
                style={{ width: CARD_WIDTH, height: 140 }} // Standardized image height
                resizeMode="cover"
              />
              {/* Bestseller Badge */}
              <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">#{index + 1}</Text>
              </View>
              {/* Sold Count Badge */}
              <View className="absolute top-2 right-2 bg-orange-500 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">{product.soldCount || 0} đã bán</Text>
              </View>
            </View>
            <View className="p-3 flex-1 justify-between">
              <View className="flex-1">
                <Text numberOfLines={2} className="font-semibold text-sm mb-1 text-gray-900" style={{ height: 36 }}>
                  {product.name}
                </Text>
                <Text className="text-xs text-gray-500 mb-2">{product.category}</Text>
                <Text className="text-xs text-gray-400 mb-2" numberOfLines={1}>
                  {stripHtmlTags(product.description)}
                </Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-bold text-red-600">
                    {formatPrice(product.price)}
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="star" size={14} color="#fbbf24" />
                    <Text className="text-xs text-gray-500 ml-1">{product.rating || 4.5}</Text>
                  </View>
                </View>
              </View>
              {/* Button always at bottom */}
              <TouchableOpacity 
                className="bg-green-600 rounded-lg py-2 px-3 flex-row items-center justify-center"
                onPress={(e) => {
                  e.stopPropagation();
                  onProductPress?.(product);
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="cart" size={14} color="white" />
                <Text className="text-white text-xs font-semibold ml-1">Mua Ngay</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};