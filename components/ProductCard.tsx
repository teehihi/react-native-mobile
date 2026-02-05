import React from 'react';
import { View, TouchableOpacity, Image, Text, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../types/api';
import { getProductImage } from '../services/api';
import { stripHtmlTags } from '../utils/textUtils';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, style }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden shadow-lg"
      style={[
        { 
          height: 320,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          borderRadius: 16, // Match rounded-2xl (16px)
          elevation: 8, // For Android
        }, 
        style
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View className="relative">
        <Image
          source={{ uri: getProductImage(product.imageUrl, product.category, product.name, product.id) }}
          style={{ width: '100%', height: 160 }} // Same height as DiscountedProductsSection
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
            <Text className="text-white text-xs font-bold">
              -{product.discountPercentage}%
            </Text>
          </View>
        ) : null}
        
        {/* Sale Badge */}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <View className="absolute top-2 right-2 bg-red-500 rounded-full px-2 py-1">
            <Text className="text-white text-xs font-bold">SALE</Text>
          </View>
        ) : null}
      </View>
      
      <View className="p-3 flex-1">
        {/* Product Name */}
        <Text numberOfLines={1} className="font-bold text-base mb-2 text-gray-900">
          {product.name}
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
            <Text className="text-xs text-gray-500 ml-1">{product.soldCount || 97}</Text>
          </View>
        </View>
        
        {/* Description */}
        <Text className="text-xs text-gray-600 mb-3" numberOfLines={2} style={{ lineHeight: 16 }}>
          {stripHtmlTags(product.description) || "Dưới đây là mô tả của sản phẩm này..... Bao gồm thông tin mô tả có ... nếu dài"}
        </Text>
        
        {/* Price and Cart Section */}
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            {/* Original Price */}
            {product.originalPrice && (
              <Text className="text-xs text-gray-400 line-through mb-1">
                {formatPrice(product.originalPrice)}
              </Text>
            )}
            {/* Current Price */}
            <Text className="text-lg font-bold text-red-600">
              {formatPrice(product.price)}
            </Text>
          </View>
          
          {/* Cart Button */}
          <TouchableOpacity 
            className="bg-green-500 rounded-xl p-3"
            onPress={(e) => {
              e.stopPropagation();
              // TODO: Add to cart logic
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cart" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;