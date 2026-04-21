import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, StatusBar, StyleSheet, Image, TextInput,
  Modal, FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore';
import { useAddressStore } from '../../store/addressStore';
import { ApiService } from '../../services/api';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = (route.params || {}) as { appliedCoupon?: any };

  const { items, getTotalPrice, clearCart } = useCartStore();
  const { selectedAddress, loadAddresses } = useAddressStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'E_WALLET' | 'BANK_TRANSFER'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(routeParams.appliedCoupon || null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [pointsData, setPointsData] = useState<any>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    loadAddresses();
    loadPoints();
  }, []);

  const loadMyCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await ApiService.getMyCoupons();
      if (res.success) setMyCoupons(res.data || []);
    } catch {}
    finally { setLoadingCoupons(false); }
  };

  const openCouponModal = () => {
    setCouponCode('');
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

  const getDiscountLabel = (c: any) => {
    if (c.discount_type === 'PERCENT' || c.discount_type === 'percentage') {
      const max = c.max_discount_amount ? ` (tối đa ${formatPrice(c.max_discount_amount)})` : '';
      return `Giảm ${c.discount_value}%${max}`;
    }
    return `Giảm ${formatPrice(c.discount_value)}`;
  };

  const loadPoints = async () => {
    try {
      const res = await ApiService.getLoyaltyPoints();
      if (res.success) setPointsData(res.data);
    } catch {}
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const subtotal = getTotalPrice();
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const pointsBalance = pointsData?.current_balance || 0;
  const pointsDiscount = usePoints ? Math.min(pointsBalance, subtotal - couponDiscount) : 0;
  const total = Math.max(0, subtotal - couponDiscount - pointsDiscount);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Thông báo', 'Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData: any = {
        items: items.map(item => ({
          productId: item.productId, productName: item.productName,
          productImage: item.productImage, price: item.price, quantity: item.quantity,
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
      };
      if (appliedCoupon) {
        orderData.couponCode = appliedCoupon.code;
        orderData.discountAmount = couponDiscount;
      }
      if (usePoints && pointsDiscount > 0) {
        orderData.pointsUsed = pointsDiscount;
      }

      const response = await ApiService.createOrder(orderData);
      if (response.success && response.data) {
        await clearCart();
        const orderCode = response.data.order.order_number || response.data.order.code || response.data.order.id;
        Alert.alert(
          'Đặt hàng thành công!',
          `Mã đơn hàng: ${orderCode}\nChúng tôi sẽ xác nhận trong vòng 30 phút.`,
          [{
            text: 'Xem đơn hàng',
            onPress: () => {
              // Pop về root của stack hiện tại (xóa Cart, Checkout khỏi history)
              (navigation as any).popToTop();
              // Rồi navigate sang tab Orders
              (navigation as any).navigate('Orders');
            }
          }]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể đặt hàng. Vui lòng thử lại.');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể đặt hàng. Vui lòng thử lại.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      
      {/* Header */}
      <LinearGradient colors={['#16a34a', '#15803d']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Thanh toán</Text>
          </View>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Shipping Address */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => navigation.navigate('AddressList' as never)}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>
          
          {selectedAddress ? (
            <View style={styles.addressContent}>
              <View style={styles.addressInfo}>
                <View style={styles.addressRow}>
                  <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                </View>
                <Text style={styles.addressPhone}>{selectedAddress.phoneNumber}</Text>
                <Text style={styles.addressDetail}>
                  {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.addressChevron} />
            </View>
          ) : (
            <View style={styles.addressContent}>
              <Text style={styles.noAddress}>Chọn địa chỉ giao hàng</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.addressChevron} />
            </View>
          )}
        </TouchableOpacity>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Sản phẩm ({items.length})</Text>
          </View>
          
          {items.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <Image
                source={{ uri: `https://picsum.photos/seed/${item.productId}/200/200` }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={styles.productQuantity}>x{item.quantity}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              </View>
              <Text style={styles.productTotal}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="truck-delivery" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          </View>
          
          <TouchableOpacity style={styles.methodRow}>
            <View style={styles.methodLeft}>
              <Text style={styles.methodName}>Giao hàng tiêu chuẩn</Text>
              <Text style={styles.methodDesc}>Nhận hàng trong 3-5 ngày</Text>
            </View>
            <Text style={styles.methodPrice}>Miễn phí</Text>
          </TouchableOpacity>
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="ticket-percent" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          </View>
          {appliedCoupon ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#16a34a" />
              <Text style={{ flex: 1, marginLeft: 8, color: '#15803d', fontWeight: '600' }}>{appliedCoupon.code} - Giảm {formatPrice(appliedCoupon.discountAmount)}</Text>
              <TouchableOpacity onPress={() => setAppliedCoupon(null)}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Nhập mã giảm giá"
                style={{ flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 }}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                onPress={() => handleApplyCouponCode(couponCode)}
                disabled={validatingCoupon}
                style={{ backgroundColor: '#16a34a', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' }}
              >
                {validatingCoupon ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: 'white', fontWeight: '600' }}>Áp dụng</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openCouponModal}
                style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center', borderWidth: 1, borderColor: '#bbf7d0' }}
              >
                <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#16a34a" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Loyalty Points */}
        {pointsData && pointsData.current_balance > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Điểm tích lũy</Text>
            </View>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: usePoints ? '#f59e0b' : '#e5e7eb', backgroundColor: usePoints ? '#fffbeb' : 'white' }}
              onPress={() => setUsePoints(!usePoints)}
            >
              <Ionicons name={usePoints ? 'checkbox' : 'square-outline'} size={22} color={usePoints ? '#f59e0b' : '#9ca3af'} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>Dùng {pointsData.current_balance.toLocaleString()} điểm</Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Giảm {formatPrice(Math.min(pointsData.current_balance, subtotal - couponDiscount))}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons
              name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={paymentMethod === 'COD' ? '#16a34a' : '#9ca3af'}
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Thanh toán khi nhận hàng (COD)</Text>
              <Text style={styles.paymentDesc}>Thanh toán bằng tiền mặt khi nhận hàng</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
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

        {pointsDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Điểm tích lũy:</Text>
            <Text style={styles.discountValue}>-{formatPrice(pointsDiscount)}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>

        <TouchableOpacity
          style={styles.orderButton}
          onPress={handlePlaceOrder}
          disabled={isSubmitting || !selectedAddress}
        >
          <LinearGradient
            colors={isSubmitting || !selectedAddress ? ['#9ca3af', '#6b7280'] : ['#16a34a', '#15803d']}
            style={styles.orderGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.orderText}>Đặt hàng</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Coupon Picker Modal */}
      <Modal visible={couponModalVisible} animationType="slide" transparent onRequestClose={() => setCouponModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mã giảm giá</Text>
              <TouchableOpacity onPress={() => setCouponModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalInputRow}>
              <TextInput
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Nhập mã giảm giá"
                style={styles.modalInput}
                autoCapitalize="characters"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => handleApplyCouponCode(couponCode)}
                disabled={validatingCoupon || !couponCode.trim()}
                style={[styles.modalApplyBtn, (!couponCode.trim() || validatingCoupon) && { opacity: 0.5 }]}
              >
                {validatingCoupon
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={styles.modalApplyText}>Áp dụng</Text>
                }
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSectionLabel}>Mã của bạn</Text>
            {loadingCoupons ? (
              <ActivityIndicator color="#16a34a" style={{ marginVertical: 24 }} />
            ) : myCoupons.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={48} color="#d1d5db" />
                <Text style={{ color: '#9ca3af', marginTop: 8, fontSize: 14 }}>Bạn chưa có mã giảm giá nào</Text>
              </View>
            ) : (
              <FlatList
                data={myCoupons}
                keyExtractor={(_, i) => i.toString()}
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: c }) => (
                  <TouchableOpacity style={styles.couponItem} onPress={() => handleApplyCouponCode(c.code)} activeOpacity={0.8}>
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
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  addressContent: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
    paddingRight: 8,
  },
  addressRow: {
    marginBottom: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  addressPhone: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  noAddress: {
    flex: 1,
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  addressChevron: {
    marginTop: 4,
  },
  productItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  productTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  methodLeft: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  methodPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16a34a',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  paymentSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  paymentDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20, // Giảm padding vì không có tab bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  freeShipping: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16a34a',
  },
  orderButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  orderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  orderText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // Modal styles
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

export default CheckoutScreen;
