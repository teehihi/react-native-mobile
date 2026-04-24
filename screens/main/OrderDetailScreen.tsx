import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiService, apiClient, getProductImage } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { contactSeller } from '../../utils/contactUtils';

const STATUS_STEPS = [
  { status: 'NEW', label: 'Đơn hàng đã được đặt', icon: 'receipt-outline' },
  { status: 'CONFIRMED', label: 'Đơn hàng đã được xác nhận', icon: 'checkmark-circle-outline' },
  { status: 'PREPARING', label: 'Đang đóng gói', icon: 'cube-outline' },
  { status: 'SHIPPING', label: 'Đang giao hàng', icon: 'car-outline' },
  { status: 'DELIVERED', label: 'Giao hàng thành công', icon: 'checkmark-done-outline' },
];

const STATUS_ORDER = ['NEW', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'];

const STATUS_BANNER: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Chờ xác nhận', color: '#f97316' },
  PENDING: { label: 'Chờ xác nhận', color: '#f97316' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#f97316' },
  PREPARING: { label: 'Đang đóng gói', color: '#8b5cf6' },
  PROCESSING: { label: 'Đang đóng gói', color: '#8b5cf6' },
  SHIPPING: { label: 'Đang giao hàng', color: '#3b82f6' },
  DELIVERED: { label: 'Giao hàng thành công', color: '#16a34a' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444' },
  CANCEL_REQUESTED: { label: 'Yêu cầu hủy', color: '#ef4444' },
};

const OrderDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [reviewStatus, setReviewStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [orderId])
  );

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getOrderById(orderId);
      if (response.success && response.data) {
        let currentOrder = response.data.order;
        
        // Auto-check ZaloPay status if it's PENDING
        const orderCode = currentOrder.order_number || currentOrder.id;
        const pStatus = currentOrder.paymentStatus || (currentOrder as any).payment_status;
        
        if (currentOrder.paymentMethod === 'ZALOPAY' && (pStatus === 'PENDING' || !pStatus)) {
          try {
            console.log('🔄 Checking ZaloPay status for:', orderCode);
            const zpStatus = await apiClient.get(`/payment/zalopay/status/${orderCode}`);
            if (zpStatus.data?.success && zpStatus.data?.isPaid) {
              console.log('✅ ZaloPay confirmed PAID. Reloading...');
              const newRes = await ApiService.getOrderById(orderId);
              if (newRes.success && newRes.data) {
                currentOrder = newRes.data.order;
              }
            }
          } catch (e) {
            console.log('Ignored ZaloPay status check error');
          }
        }
        
        setOrder(currentOrder);
        setReviewStatus(response.data.reviewStatus || null);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy đơn hàng');
        navigation.goBack();
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrder = (order: Order): boolean => {
    if (!order.canCancel || order.status === 'CANCELLED' || order.status === 'DELIVERED') return false;
    if (order.cancelDeadline) return new Date() < new Date(order.cancelDeadline);
    return false;
  };

  const handleCancelOrder = () => {
    if (!order) return;
    Alert.alert(
      'Hủy đơn hàng',
      `Bạn có chắc muốn hủy đơn hàng ${order.order_number || order.id}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            const response = await ApiService.cancelOrder(order.id);
            if (response.success) {
              loadOrder();
              Alert.alert('Thành công', 'Đã hủy đơn hàng');
            } else {
              Alert.alert('Lỗi', response.message || 'Không thể hủy đơn hàng');
            }
          },
        },
      ]
    );
  };

  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      setLoading(true);
      const orderCode = order.order_number || order.id;
      const total = order.totalAmount;
      
      if (order.paymentMethod === 'VNPAY') {
        const payRes = await apiClient.post('/payment/vnpay/create-url', {
          orderId: orderCode,
          amount: total,
          orderInfo: `Thanh toan don hang ${orderCode}`,
        });
        if (payRes.data?.success && payRes.data?.data?.paymentUrl) {
          await Linking.openURL(payRes.data.data.paymentUrl);
        } else {
          Alert.alert('Lỗi', 'Không thể tạo URL thanh toán VNPAY');
        }
      } else if (order.paymentMethod === 'ZALOPAY') {
        // MOMO is actually using ZaloPay in this logic flow
        const zpRes = await apiClient.post('/payment/zalopay/create-order', {
          orderId: orderCode,
          amount: total,
          description: `Thanh toan don hang ${orderCode}`,
        });
        if (zpRes.data?.success && zpRes.data?.data?.orderUrl) {
          console.log('🔗 [ZALOPAY SANDBOX URL]:', zpRes.data.data.orderUrl);
          await Linking.openURL(zpRes.data.data.orderUrl);
        } else {
          Alert.alert('Lỗi', 'Không thể tạo đơn ZaloPay');
        }
      }
    } catch (e) {
      console.error('Retry payment error:', e);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tạo lại thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const getStepTimestamp = (step: typeof STATUS_STEPS[0], order: Order): string => {
    switch (step.status) {
      case 'NEW': return formatDateTime(order.createdAt);
      case 'CONFIRMED': return formatDateTime(order.confirmedAt);
      case 'DELIVERED': return formatDateTime(order.deliveredAt);
      default: return '';
    }
  };

  const getEstimatedDelivery = (order: Order): string => {
    const created = new Date(order.createdAt);
    created.setDate(created.getDate() + 3);
    return created.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const subtotal = order ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
  const shippingFee = 30000;
  const discount = order ? Math.max(0, subtotal + shippingFee - order.totalAmount) : 0;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>Chi tiết đơn hàng</Text>
          </View>
        </SafeAreaView>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </View>
    );
  }

  if (!order) return null;

  const bannerCfg = STATUS_BANNER[order.status] || STATUS_BANNER.PENDING;
  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const canCancel = canCancelOrder(order);

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>Chi tiết đơn hàng</Text>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>{order.order_number || order.id}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Status Banner */}
        {order.status !== 'CANCELLED' && order.status !== 'CANCEL_REQUESTED' && (
          <View style={{
            backgroundColor: bannerCfg.color,
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              <Ionicons name="car-outline" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{bannerCfg.label}</Text>
              {order.status === 'SHIPPING' && (
                <>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>
                    Mã vận đơn: VN{order.numericId || '123456789'}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                    Dự kiến giao hàng: {getEstimatedDelivery(order)}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* Timeline */}
        {order.status !== 'CANCELLED' && order.status !== 'CANCEL_REQUESTED' ? (
          <View style={{ backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: '#1f2937', marginBottom: 16 }}>
              Trạng thái đơn hàng
            </Text>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const timestamp = getStepTimestamp(step, order);
              return (
                <View key={step.status} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: index < STATUS_STEPS.length - 1 ? 0 : 0 }}>
                  {/* Line + dot */}
                  <View style={{ alignItems: 'center', width: 32, marginRight: 12 }}>
                    <View style={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: isActive ? '#16a34a' : '#e5e7eb',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ionicons
                        name={step.icon as any}
                        size={14}
                        color={isActive ? '#fff' : '#9ca3af'}
                      />
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View style={{
                        width: 2, height: 32,
                        backgroundColor: index < currentStepIndex ? '#16a34a' : '#e5e7eb',
                      }} />
                    )}
                  </View>
                  {/* Label */}
                  <View style={{ flex: 1, paddingTop: 4, paddingBottom: index < STATUS_STEPS.length - 1 ? 0 : 0, minHeight: 44 }}>
                    <Text style={{
                      fontWeight: isCurrent ? '700' : '500',
                      color: isActive ? '#1f2937' : '#9ca3af',
                      fontSize: 14,
                    }}>
                      {step.label}
                    </Text>
                    {timestamp ? (
                      <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{timestamp}</Text>
                    ) : isCurrent ? null : !isActive ? (
                      <Text style={{ color: '#d1d5db', fontSize: 12, marginTop: 2 }}>
                        {index === STATUS_STEPS.length - 1 ? `Dự kiến ${getEstimatedDelivery(order)}` : ''}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </View>
              <View>
                <Text style={{ fontWeight: '700', color: '#ef4444', fontSize: 15 }}>
                  {order.status === 'CANCEL_REQUESTED' ? 'Đang yêu cầu hủy đơn' : 'Đơn hàng đã bị hủy'}
                </Text>
                {order.cancelledAt && (
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{formatDateTime(order.cancelledAt)}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Shipping Address */}
        <View style={{ backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 10,
            }}>
              <Ionicons name="location" size={16} color="#16a34a" />
            </View>
            <Text style={{ fontWeight: '700', fontSize: 15, color: '#1f2937' }}>Địa chỉ giao hàng</Text>
          </View>
          <Text style={{ fontWeight: '600', color: '#1f2937', fontSize: 14 }}>
            {order.shippingAddress.fullName} | {order.shippingAddress.phoneNumber}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4, lineHeight: 20 }}>
            {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
          </Text>
          {order.shippingAddress.note && (
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>
              Ghi chú: {order.shippingAddress.note}
            </Text>
          )}
        </View>

        {/* Products */}
        <View style={{ backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: '#faf5ff', alignItems: 'center', justifyContent: 'center', marginRight: 10,
            }}>
              <Ionicons name="bag-outline" size={16} color="#8b5cf6" />
            </View>
            <Text style={{ fontWeight: '700', fontSize: 15, color: '#1f2937' }}>
              Sản phẩm ({order.items.length})
            </Text>
          </View>

          {order.items.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                paddingVertical: 12,
                borderTopWidth: index > 0 ? 1 : 0,
                borderTopColor: '#f3f4f6',
              }}
            >
              <Image
                source={{
                  uri: getProductImage(
                    item.productImage || '',
                    (item as any).category || '',
                    item.productName,
                    item.productId
                  ),
                }}
                style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#f3f4f6' }}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '600', color: '#1f2937', fontSize: 14 }} numberOfLines={2}>
                  {item.productName}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 13 }}>x{item.quantity}</Text>
                  <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 14 }}>
                    {formatPrice(item.price)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <View style={{ backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: '#1f2937', marginBottom: 12 }}>
            Thông tin thanh toán
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>Tạm tính</Text>
            <Text style={{ color: '#1f2937', fontSize: 14 }}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>Phí vận chuyển</Text>
            <Text style={{ color: '#1f2937', fontSize: 14 }}>{formatPrice(shippingFee)}</Text>
          </View>
          {discount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>Giảm giá</Text>
              <Text style={{ color: '#ef4444', fontSize: 14 }}>-{formatPrice(discount)}</Text>
            </View>
          )}

          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 4,
          }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: '#1f2937' }}>Tổng cộng</Text>
            <Text style={{ fontWeight: '700', fontSize: 18, color: '#16a34a' }}>
              {formatPrice(order.totalAmount)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>Phương thức thanh toán</Text>
            <Text style={{ color: '#1f2937', fontSize: 13, fontWeight: '500' }}>
              {(() => {
                switch (order.paymentMethod) {
                  case 'COD': return 'Thanh toán khi nhận hàng';
                  case 'ZALOPAY': return 'Ví điện tử ZaloPay';
                  case 'VNPAY': return 'VNPay';
                  case 'BANK_TRANSFER': return 'Chuyển khoản ngân hàng';
                  case 'CREDIT_CARD': return 'Thẻ tín dụng/Ghi nợ';
                  default: return order.paymentMethod;
                }
              })()}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>Trạng thái</Text>
            {(() => {
              // Kiểm tra tất cả các field có thể có
              const s1 = order.paymentStatus;
              const s2 = (order as any).payment_status;
              const rawStatus = s1 || s2 || 'PENDING';
              const paymentStatus = String(rawStatus).toUpperCase();
              
              console.log('--- UI CHECK ---', { s1, s2, final: paymentStatus });
              
              let color = '#f97316';
              let label = 'Chưa thanh toán';
              
              // Chấp nhận mọi biến thể của thành công
              if (paymentStatus === 'PAID' || 
                  paymentStatus === 'COMPLETED' || 
                  paymentStatus === 'SUCCESS') { 
                color = '#16a34a'; 
                label = 'Đã thanh toán'; 
              }
              else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') { 
                color = '#ef4444'; 
                label = 'Thanh toán thất bại'; 
              }
              
              return <Text style={{ color, fontSize: 13, fontWeight: '500' }}>{label}</Text>;
            })()}
          </View>
        </View>

        {/* Review section */}
        {order.status === 'DELIVERED' && reviewStatus?.canReview && (
          <View style={{ marginHorizontal: 16, marginTop: 12 }}>
            {reviewStatus.allReviewed ? (
              <View style={{ backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontWeight: '600', fontSize: 15 }}>Đã đánh giá sản phẩm</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={{ backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                onPress={() => {
                  if (order.items.length > 0) {
                    (navigation as any).navigate('WriteReview', {
                      orderId: order.numericId || order.id,
                      items: order.items.map((item: any) => ({
                        productId: item.productId,
                        productName: item.productName,
                        productImage: item.productImage,
                        category: item.category || '',
                      })),
                    });
                  }
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Đánh giá sản phẩm</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom action buttons */}
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              borderWidth: 1.5,
              borderColor: '#16a34a',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
            onPress={() => contactSeller('facebook', '100013674606987')}
          >
            <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 15 }}>Liên hệ người bán</Text>
          </TouchableOpacity>

          {(order.paymentStatus === 'PENDING' || (order as any).payment_status === 'PENDING') && order.paymentMethod !== 'COD' && order.status !== 'CANCELLED' && order.status !== 'CANCEL_REQUESTED' && order.status === 'PENDING' ? (
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
              onPress={handleRetryPayment}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Thanh toán lại</Text>
            </TouchableOpacity>
          ) : order.status === 'SHIPPING' ? (
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
              onPress={() => Alert.alert('Theo dõi', 'Tính năng đang phát triển')}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Theo dõi đơn hàng</Text>
            </TouchableOpacity>
          ) : canCancel ? (
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
              onPress={handleCancelOrder}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          ) : null}
        </View>

      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen;
