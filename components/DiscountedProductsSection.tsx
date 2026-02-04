import React from 'react';
import { View, TouchableOpacity, Dimensions, Image, Text, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../types/api';
import { getProductImage } from '../services/api';
import { stripHtmlTags } from '../utils/textUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns

interface DiscountedProductsSectionProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export const DiscountedProductsSection: React.FC<DiscountedProductsSectionProps> = ({ 
  products, 
  onProductPress 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      className="mb-4 bg-white rounded-2xl overflow-hidden shadow-sm"
      style={{ width: CARD_WIDTH, height: 320 }} // Increased height for new layout
      activeOpacity={0.9}
      onPress={() => onProductPress?.(item)}
    >
      <View className="relative">
        <Image
          source={{ uri: getProductImage(item.imageUrl, item.category, item.name, item.id) }}
          style={{ width: CARD_WIDTH, height: 160 }} // Larger image
          resizeMode="cover"
        />
        {/* Discount Badge */}
        <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-bold">
            -{item.discountPercentage || 0}%
          </Text>
        </View>
        {/* Sale Badge */}
        <View className="absolute top-2 right-2 bg-red-500 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-bold">SALE</Text>
        </View>
      </View>
      
      <View className="p-3 flex-1">
        {/* Product Name */}
        <Text numberOfLines={1} className="font-bold text-base mb-2 text-gray-900">
          {item.name}
        </Text>
        
        {/* Rating Section */}
        <View className="flex-row items-center mb-2">
          {/* 5 Stars */}
          {[1, 2, 3, 4, 5].map((star) => (
            <MaterialCommunityIcons 
              key={star}
              name="star" 
              size={16} 
              color="#fbbf24" 
              style={{ marginRight: 2 }}
            />
          ))}
          {/* Review Count */}
          <View className="flex-row items-center ml-2">
            <MaterialCommunityIcons name="message-text" size={14} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">{item.soldCount || 97}</Text>
          </View>
        </View>
        
        {/* Description */}
        <Text className="text-xs text-gray-600 mb-3" numberOfLines={2} style={{ lineHeight: 16 }}>
          {stripHtmlTags(item.description) || "Dưới đây là mô tả của sản phẩm này..... Bao gồm thông tin mô tả có ... nếu dài"}
        </Text>
        
        {/* Price and Cart Section */}
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            {/* Original Price */}
            {item.originalPrice && (
              <Text className="text-xs text-gray-400 line-through mb-1">
                {formatPrice(item.originalPrice)}
              </Text>
            )}
            {/* Current Price */}
            <Text className="text-lg font-bold text-red-600">
              {formatPrice(item.price)}
            </Text>
          </View>
          
          {/* Cart Button */}
          <TouchableOpacity 
            className="bg-green-500 rounded-xl p-3"
            onPress={(e) => {
              e.stopPropagation();
              onProductPress?.(item);
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cart" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="px-4 mt-6 pb-28">
      <View className="mb-3 flex-row justify-between items-center">
        <Text className="text-lg font-bold text-gray-900">⚡ Giảm Giá Sốc</Text>
        <TouchableOpacity className="flex-row items-center">
          <MaterialCommunityIcons name="chevron-right" size={24} color="#16a34a" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        scrollEnabled={false} // Disable scroll since it's inside ScrollView
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};