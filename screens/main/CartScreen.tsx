import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../../store/cartStore';
import { formatImageUrl, ApiService } from '../../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const CartScreen = () => {
  const navigation = useNavigation();
  const { items, isLoading, loadCart, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCartStore();
  const [refreshing, setRefreshing] = useState(false);

  // Coupon state
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  useFocusEffect(useCallback(() => {
    // reload cart when coming back
    loadCart();
  }, []));

  const loadMyCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await ApiService.getMyCoupons();
      if (res.success) setMyCoupons(res.data || []);
    } catch {}
    finally { setLoadingCoupons(false); }
  };

  const openCouponModal = () => {
    setCouponInput('');
    loadMyCoupons();
    setCouponModalVisible(true);
  };

  const handleApplyCouponCode = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setValidatingCoupon(true);
    try {
      const res = await ApiService.validateCoupon(trimmed, subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        setCouponModalVisible(false);
        Alert.alert('Áp dụng thành công', `Giảm ${formatPrice(res.data.discountAmount)}`);
      } else {
        Alert.alert('Lỗi', res.message || 'Mã không hợp lệ hoặc đã hết hạn');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể kiểm tra mã giảm giá');
    } finally { setValidatingCoupon(false); }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const handleRemove = (itemId: string, productName: string) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => removeItem(itemId) },
      ]
    );
  };

  const handleQuantityChange = (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty > 0) updateQuantity(itemId, newQty);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getDiscountLabel = (c: any) => {
    if (c.discount_type === 'PERCENT' || c.discount_type === 'percentage') {
      const max = c.max_discount_amount ? ` (tối đa ${formatPrice(c.max_discount_amount)})` : '';
      return `Giảm ${c.discount_value}%${max}`;
    }
    return `Giảm ${formatPrice(c.discount_value)}`;
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
        <LinearGradient colors={['#16a34a', '#15803d']} style={styles.headerWithSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Giỏ hàng</Text>
            </View>
            <View style={styles.backButton} />
          </View>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons name="cart-outline" size={100} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('Homepage' as never)} activeOpacity={0.8}>
            <LinearGradient colors={['#16a34a', '#15803d']} style={styles.shopButtonGradient}>
              <MaterialCommunityIcons name="shopping" size={20} color="white" />
              <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const subtotal = getTotalPrice();
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = subtotal - couponDiscount;

  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <LinearGradient colors={['#16a34a', '#15803d']} style={styles.headerWithSafeArea}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Giỏ hàng</Text>
            <Text style={styles.headerSubtitle}>{getTotalItems()} sản phẩm</Text>
          </View>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: `https://picsum.photos/seed/${item.productId}/200/200` }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                {item.originalPrice && item.originalPrice > item.price && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>{formatPrice(item.price)}</Text>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                  )}
                </View>
                <View style={styles.bottomRow}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(item.id, item.quantity, -1)} activeOpacity={0.7}>
                      <Ionicons name="remove" size={16} color="#16a34a" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(item.id, item.quantity, 1)} activeOpacity={0.7}>
                      <Ionicons name="add" size={16} color="#16a34a" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item.id, item.productName)} style={styles.deleteButton} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemTotal}>Tổng: {formatPrice(item.price * item.quantity)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Voucher Section */}
        {appliedCoupon ? (
          <View style={[styles.voucherContainer, { borderColor: '#16a34a', borderStyle: 'solid', backgroundColor: '#f0fdf4' }]}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#16a34a" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: '700', color: '#15803d', fontSize: 14 }}>{appliedCoupon.code}</Text>
              <Text style={{ color: '#16a34a', fontSize: 13, marginTop: 2 }}>Giảm {formatPrice(appliedCoupon.discountAmount)}</Text>
            </View>
            <TouchableOpacity onPress={handleRemoveCoupon} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.voucherContainer} onPress={openCouponModal} activeOpacity={0.7}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#16a34a" />
            <Text style={styles.voucherText}>Chọn hoặc nhập mã giảm giá</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}

        <View style={{ height: 240 }} />
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.freeShipping}>Miễn phí</Text>
          </View>
          {couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mã giảm giá:</Text>
              <Text style={styles.discountValue}>-{formatPrice(couponDiscount)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout' as never, { appliedCoupon } as never)}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#16a34a', '#15803d']} style={styles.checkoutGradient}>
            <Text style={styles.checkoutText}>Thanh toán</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Coupon Modal */}
      <Modal visible={couponModalVisible} animationType="slide" transparent onRequestClose={() => setCouponModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mã giảm giá</Text>
              <TouchableOpacity onPress={() => setCouponModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Manual input */}
            <View style={styles.modalInputRow}>
              <TextInput
                value={couponInput}
                onChangeText={setCouponInput}
                placeholder="Nhập mã giảm giá"
                style={styles.modalInput}
                autoCapitalize="characters"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => handleApplyCouponCode(couponInput)}
                disabled={validatingCoupon || !couponInput.trim()}
                style={[styles.modalApplyBtn, (!couponInput.trim() || validatingCoupon) && { opacity: 0.5 }]}
              >
                {validatingCoupon
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={styles.modalApplyText}>Áp dụng</Text>
                }
              </TouchableOpacity>
            </View>

            {/* My coupons list */}
            <Text style={styles.modalSectionLabel}>Mã của bạn</Text>
            {loadingCoupons ? (
              <ActivityIndicator color="#16a34a" style={{ marginVertical: 24 }} />
            ) : myCoupons.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={48} color="#d1d5db" />
                <Text style={{ color: '#9ca3af', marginTop: 8, fontSize: 14 }}>Bạn chưa có mã giảm giá nào</Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Đánh giá sản phẩm để nhận mã</Text>
              </View>
            ) : (
              <FlatList
                data={myCoupons}
                keyExtractor={(_, i) => i.toString()}
                style={{ maxHeight: 320 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: c }) => (
                  <TouchableOpacity
                    style={styles.couponItem}
                    onPress={() => handleApplyCouponCode(c.code)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient colors={['#16a34a', '#15803d']} style={styles.couponLeft}>
                      <Text style={styles.couponCode}>{c.code}</Text>
                      <Text style={styles.couponDiscount}>{getDiscountLabel(c)}</Text>
                    </LinearGradient>
                    <View style={styles.couponRight}>
                      <Text style={styles.couponMin} numberOfLines={1}>
                        {c.min_order_amount > 0 ? `Đơn tối thiểu ${formatPrice(c.min_order_amount)}` : 'Không giới hạn'}
                      </Text>
                      <Text style={styles.couponExpiry}>HSD: {new Date(c.expires_at).toLocaleDateString('vi-VN')}</Text>
                      <Text style={styles.couponUse}>Dùng ngay</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  headerWithSafeArea: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: 'white' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIconContainer: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  shopButton: { marginTop: 32, borderRadius: 12, overflow: 'hidden' },
  shopButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 14, gap: 8 },
  shopButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 240 },
  itemsContainer: { paddingHorizontal: 16, paddingTop: 16 },
  cartItem: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  imageContainer: { position: 'relative' },
  productImage: { width: 100, height: 100, borderRadius: 12 },
  discountBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { fontSize: 10, fontWeight: '700', color: 'white' },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: '#1f2937', lineHeight: 20, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  currentPrice: { fontSize: 17, fontWeight: '700', color: '#16a34a' },
  originalPrice: { fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through', marginLeft: 8 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 2 },
  quantityButton: { width: 28, height: 28, borderRadius: 6, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontSize: 15, fontWeight: '600', color: '#1f2937', paddingHorizontal: 12 },
  deleteButton: { padding: 6 },
  itemTotal: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  voucherContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed' },
  voucherText: { flex: 1, fontSize: 15, color: '#1f2937', marginLeft: 12 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  summaryContainer: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 15, color: '#6b7280' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  freeShipping: { fontSize: 15, fontWeight: '600', color: '#16a34a' },
  discountValue: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 17, fontWeight: '600', color: '#1f2937' },
  totalValue: { fontSize: 22, fontWeight: '700', color: '#16a34a' },
  checkoutButton: { borderRadius: 12, overflow: 'hidden' },
  checkoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  checkoutText: { fontSize: 17, fontWeight: '700', color: 'white' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  modalInputRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  modalInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1f2937', backgroundColor: '#f9fafb' },
  modalApplyBtn: { backgroundColor: '#16a34a', paddingHorizontal: 18, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalApplyText: { color: 'white', fontWeight: '700', fontSize: 14 },
  modalSectionLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  couponItem: { flexDirection: 'row', borderRadius: 12, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  couponLeft: { width: 110, padding: 12, justifyContent: 'center', alignItems: 'center' },
  couponCode: { color: 'white', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  couponDiscount: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4, textAlign: 'center' },
  couponRight: { flex: 1, padding: 12, justifyContent: 'center' },
  couponMin: { fontSize: 12, color: '#6b7280' },
  couponExpiry: { fontSize: 11, color: '#ef4444', marginTop: 3 },
  couponUse: { fontSize: 13, fontWeight: '700', color: '#16a34a', marginTop: 6 },
});

export default CartScreen;
