import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiService, getProductImage } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import { useNavigation, NavigationProp, CommonActions, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore';

type TabKey = 'ALL' | 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

const TABS: { key: TabKey; label: string; statuses: OrderStatus[] }[] = [
  { key: 'ALL', label: 'Tất cả', statuses: [] },
  { key: 'PENDING', label: 'Chờ xác nhận', statuses: ['NEW', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PREPARING'] },
  { key: 'SHIPPING', label: 'Đang giao', statuses: ['SHIPPING', 'SHIPPED'] },
  { key: 'DELIVERED', label: 'Hoàn thành', statuses: ['DELIVERED', 'COMPLETE', 'complete'] },
  { key: 'CANCELLED', label: 'Đã hủy', statuses: ['CANCELLED', 'CANCEL_REQUESTED'] },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: '#f97316', bgColor: '#fff7ed', icon: 'time-outline' },
  CONFIRMED: { label: 'Chờ xác nhận', color: '#f97316', bgColor: '#fff7ed', icon: 'time-outline' },
  PROCESSING: { label: 'Đang xử lý', color: '#8b5cf6', bgColor: '#f5f3ff', icon: 'sync-outline' },
  SHIPPING: { label: 'Đang giao hàng', color: '#3b82f6', bgColor: '#eff6ff', icon: 'car-outline' },
  DELIVERED: { label: 'Đã giao', color: '#16a34a', bgColor: '#f0fdf4', icon: 'checkmark-circle-outline' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bgColor: '#fef2f2', icon: 'close-circle-outline' },
  NEW: { label: 'Mới', color: '#f97316', bgColor: '#fff7ed', icon: 'time-outline' },
  PREPARING: { label: 'Đang chuẩn bị', color: '#8b5cf6', bgColor: '#f5f3ff', icon: 'sync-outline' },
  CANCEL_REQUESTED: { label: 'Yêu cầu hủy', color: '#ef4444', bgColor: '#fef2f2', icon: 'close-circle-outline' },
};

const OrdersScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const addItem = useCartStore((state) => state.addItem);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>(
    ((route.params as any)?.initialTab as TabKey) || 'ALL'
  );

  // Mỗi lần màn hình được focus, đọc lại initialTab từ params
  useFocusEffect(
    useCallback(() => {
      const tab = (route.params as any)?.initialTab as TabKey;
      if (tab) setActiveTab(tab);
    }, [route.params])
  );

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getUserOrders({ page: 1, limit: 50 });
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getTabCount = (tab: typeof TABS[0]) => {
    if (tab.key === 'ALL') return 0;
    return orders.filter(o => tab.statuses.includes(o.status)).length;
  };

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter(o => {
        const tab = TABS.find(t => t.key === activeTab);
        return tab ? tab.statuses.includes(o.status) : true;
      });

  const canCancelOrder = (order: Order): boolean => {
    if (!order.canCancel || order.status === 'CANCELLED' || order.status === 'DELIVERED') return false;
    if (order.cancelDeadline) return new Date() < new Date(order.cancelDeadline);
    return false;
  };

  const handleCancelOrder = async (order: Order) => {
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
              loadOrders();
              Alert.alert('Thành công', 'Đã hủy đơn hàng');
            } else {
              Alert.alert('Lỗi', response.message || 'Không thể hủy đơn hàng');
            }
          },
        },
      ]
    );
  };

  const handleReorder = async (order: Order) => {
    try {
      setReorderingId(order.id);
      for (const item of order.items) {
        await addItem(
          item.productId,
          item.productName,
          item.productImage || '',
          item.price,
          undefined,
          (item as any).category || ''
        );
      }
      // Cart nằm trong MainStackNavigator (tab Home), cần navigate đúng nested path
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Home',
          params: {
            screen: 'Cart',
          },
        })
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setReorderingId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    if (status === 'DELIVERED') return { name: 'checkmark-circle', color: cfg.color };
    if (status === 'CANCELLED' || status === 'CANCEL_REQUESTED') return { name: 'close-circle', color: cfg.color };
    if (status === 'SHIPPING') return { name: 'car', color: cfg.color };
    return { name: cfg.icon.replace('-outline', ''), color: cfg.color };
  };

  const renderOrderCard = (order: Order) => {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const canCancel = canCancelOrder(order);
    const firstItem = order.items[0];
    const statusIcon = getStatusIcon(order.status);

    return (
      <TouchableOpacity
        key={order.id}
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          marginHorizontal: 16,
          marginBottom: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
        activeOpacity={0.85}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={statusIcon.name as any} size={18} color={statusIcon.color} />
            <Text style={{ fontWeight: '700', fontSize: 15, color: '#1f2937', marginLeft: 6 }}>
              {order.order_number || order.code || order.id}
            </Text>
          </View>
          <View style={{ backgroundColor: cfg.bgColor, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '600' }}>{cfg.label}</Text>
          </View>
        </View>

        {/* Date */}
        <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 12 }}>
          {formatDate(order.createdAt)}
        </Text>

        {/* Product row */}
        {firstItem && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image
              source={{
                uri: getProductImage(
                  firstItem.productImage || '',
                  (firstItem as any).category || '',
                  firstItem.productName,
                  firstItem.productId
                ),
              }}
              style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6' }}
              resizeMode="cover"
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>x{firstItem.quantity}</Text>
              <Text style={{ color: '#1f2937', fontSize: 14, fontWeight: '500' }} numberOfLines={2}>
                {firstItem.productName}
              </Text>
              <Text style={{ color: '#16a34a', fontWeight: '600', fontSize: 14, marginTop: 2 }}>
                {formatPrice(firstItem.price)}
              </Text>
            </View>
          </View>
        )}

        {order.items.length > 1 && (
          <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>
            và {order.items.length - 1} sản phẩm khác
          </Text>
        )}

        {/* Total */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: '#6b7280', fontSize: 14 }}>Tổng tiền</Text>
          <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 16 }}>
            {formatPrice(order.totalAmount)}
          </Text>
        </View>

        {/* Action buttons */}
        {order.status === 'DELIVERED' && (
          <TouchableOpacity
            style={{
              backgroundColor: reorderingId === order.id ? '#15803d' : '#16a34a',
              borderRadius: 10, paddingVertical: 12, alignItems: 'center',
              opacity: reorderingId === order.id ? 0.8 : 1,
            }}
            onPress={() => handleReorder(order)}
            disabled={reorderingId === order.id}
          >
            {reorderingId === order.id ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Đang thêm...</Text>
              </View>
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Mua lại</Text>
            )}
          </TouchableOpacity>
        )}

        {order.status === 'SHIPPING' && (
          <TouchableOpacity
            style={{ backgroundColor: '#3b82f6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Theo dõi đơn</Text>
          </TouchableOpacity>
        )}

        {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {canCancel && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderWidth: 1.5,
                  borderColor: '#ef4444',
                  borderRadius: 10,
                  paddingVertical: 11,
                  alignItems: 'center',
                }}
                onPress={() => handleCancelOrder(order)}
              >
                <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 14 }}>Hủy đơn</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#16a34a',
                borderRadius: 10,
                paddingVertical: 11,
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Liên hệ</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>Đơn hàng của tôi</Text>
        </View>
      </SafeAreaView>

      {/* Tabs - tách riêng khỏi SafeAreaView để tránh bị clip */}
      <View style={{ backgroundColor: '#fff', paddingBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingRight: 32 }}
          nestedScrollEnabled
        >
          {TABS.map((tab) => {
            const count = getTabCount(tab);
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? '#16a34a' : '#f3f4f6',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: isActive ? '#fff' : '#6b7280', fontWeight: '600', fontSize: 13 }}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={{
                    backgroundColor: isActive ? '#fff' : '#ef4444',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 6,
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: isActive ? '#16a34a' : '#fff', fontSize: 11, fontWeight: '700' }}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Order list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#16a34a" />}
      >
        {filteredOrders.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <Ionicons name="receipt-outline" size={72} color="#d1d5db" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 16 }}>
              Chưa có đơn hàng
            </Text>
            <Text style={{ color: '#9ca3af', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
              Bạn chưa có đơn hàng nào trong mục này
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#16a34a', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, marginTop: 20 }}
              onPress={() => navigation.navigate('Homepage')}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Mua sắm ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map(renderOrderCard)
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;
