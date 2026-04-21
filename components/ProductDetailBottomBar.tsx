import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const BAR_WIDTH = width - 32;

interface ProductDetailBottomBarProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  price: number;
}

export const ProductDetailBottomBar: React.FC<ProductDetailBottomBarProps> = ({
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  price,
}) => {
  const insets = useSafeAreaInsets();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const renderContent = () => (
    <View style={styles.content}>
      {/* White overlay for premium glass look */}
      <View style={styles.whiteOverlay} />
      {/* Top light reflection */}
      <View style={styles.topReflection} />
      
      {/* Quantity Section */}
      <View style={styles.quantitySection}>
        <Text style={styles.quantityLabel}>Số lượng</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onQuantityChange(quantity + 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={onAddToCart}
          activeOpacity={0.7}
        >
          <View style={styles.cartButtonInner}>
            <MaterialCommunityIcons name="cart-plus" size={22} color="#10b981" />
            <Text style={styles.cartButtonText}>Giỏ hàng</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBuyNow}
          style={styles.buyNowButton}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.buyNowGradient}
          >
            <Text style={styles.buyNowText}>Mua ngay</Text>
            <Text style={styles.buyNowPrice}>{formatPrice(price * quantity)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const containerPaddingBottom = Math.max(insets.bottom - 4, 12);

  return (
    <View style={[styles.wrapper, { paddingBottom: containerPaddingBottom }]}>
      <View style={styles.glassWrapper}>
        {/* Soft shadow underneath */}
        <View style={styles.shadowLayer} />

        {Platform.OS === 'ios' && isLiquidGlassSupported ? (
          <LiquidGlassView
            effect="clear"
            interactive={false}
            style={styles.glassContainer}
          >
            {renderContent()}
          </LiquidGlassView>
        ) : (
          <BlurView intensity={100} tint="light" style={styles.glassContainer}>
            {renderContent()}
          </BlurView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  glassWrapper: {
    width: BAR_WIDTH,
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glassContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  whiteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  topReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  quantityButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    minWidth: 50,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cartButton: {
    flex: 0.35,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 253, 244, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    overflow: 'hidden',
  },
  cartButtonInner: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  buyNowButton: {
    flex: 0.65,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyNowGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  buyNowPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
