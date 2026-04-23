import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../types/api';
import { getProductImage } from '../services/api';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  style?: any;
}

const formatPrice = (price: number | undefined | null) => {
  if (!price && price !== 0) return '---';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
};

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onPress, style }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: getProductImage(product.imageUrl, product.category, product.name, product.id) }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        {hasDiscount && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
            </Text>
          </View>
        )}
        
        {product.soldCount > 0 && (
          <View style={styles.soldBadge}>
            <MaterialCommunityIcons name="fire" size={10} color="#fff" />
            <Text style={styles.soldText}>Đã bán {product.soldCount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {hasDiscount && (
            <Text style={styles.oldPrice}>{formatPrice(product.originalPrice!)}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating ? product.rating.toFixed(1) : '0.0'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={(e) => {
            e.stopPropagation();
            // Add to cart logic
          }}
        >
          <MaterialCommunityIcons name="plus" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB', // Slightly darker border
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
    backgroundColor: '#F9FAFB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  soldBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
    position: 'relative',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
    height: 40,
  },
  priceSection: {
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00B14F', // Grab Green
  },
  oldPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#00B14F', // Grab Green
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const ProductGlassCard = memo(ProductCardComponent);
