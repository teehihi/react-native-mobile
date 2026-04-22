import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import { useNavigation } from '@react-navigation/native';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

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
        console.error('Failed to load orders:', response.message);
        setOrders([]);
      }
    } catch (error) {
      console.error('Load orders error:', error);
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

  const getStatusInfo = (status: OrderStatus) => {
    const statusMap = {
      PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: 'time-outline' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: 'checkmark-circle-outline' },
      PROCESSING: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-700', icon: 'sync-outline' },
      SHIPPING: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-700', icon: 'car-outline' },
      DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: 'checkmark-done-outline' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: 'close-circle-outline' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const canCancelOrder = (order: Order): boolean => {
    if (!order.canCancel || order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      return false;
    }
    
    if (order.cancelDeadline) {
      const deadline = new Date(order.cancelDeadline);
      return new Date() < deadline;
    }
    
    return false;
  };

  const handleCancelOrder = async (order: Order) => {
    Alert.alert(
      'Hủy đơn hàng',
      `Bạn có chắc muốn hủy đơn hàng ${order.id}?`,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
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

  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#16a34a', '#15803d']} style={{ paddingTop: 0 }}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#16a34a' }}>
            <View className="px-4 py-4 flex-row items-center">
              <Text className="text-white text-xl font-bold">Đơn hàng của tôi</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="receipt-outline" size={80} color="#d1d5db" />
          <Text className="text-xl font-semibold text-gray-700 mt-4">Chưa có đơn hàng</Text>
          <Text className="text-gray-500 text-center mt-2">
            Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!
          </Text>
          <TouchableOpacity
            className="bg-green-600 px-8 py-3 rounded-lg mt-6"
            onPress={() => navigation.navigate('Homepage' as never)}
          >
            <Text className="text-white font-semibold">Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#16a34a', '#15803d']} style={{ paddingTop: 0 }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#16a34a' }}>
          <View className="px-4 py-4 flex-row items-center">
            <Text className="text-white text-xl font-bold">Đơn hàng của tôi</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View className="px-4 pt-4 pb-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const canCancel = canCancelOrder(order);

            return (
              <TouchableOpacity
                key={order.id}
                className="bg-white rounded-xl p-4 mb-4 shadow-sm"
                onPress={() => navigation.navigate('OrderDetail' as never, { orderId: order.id } as never)}
              >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <View>
                    <Text className="font-bold text-gray-800">Mã đơn: {order.id}</Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${statusInfo.color}`}>
                    <Text className={`text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Items */}
                <View className="mb-3">
                  {order.items.slice(0, 2).map((item, index) => (
                    <Text key={index} className="text-gray-600 text-sm mb-1">
                      • {item.productName} x{item.quantity}
                    </Text>
                  ))}
                  {order.items.length > 2 && (
                    <Text className="text-gray-500 text-sm">
                      và {order.items.length - 2} sản phẩm khác
                    </Text>
                  )}
                </View>

                {/* Footer */}
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
                  <View>
                    <Text className="text-gray-600 text-sm">Tổng tiền:</Text>
                    <Text className="text-green-600 font-bold text-lg">
                      {formatPrice(order.totalAmount)}
                    </Text>
                  </View>

                  {canCancel && (
                    <TouchableOpacity
                      className="bg-red-100 px-4 py-2 rounded-lg"
                      onPress={() => handleCancelOrder(order)}
                    >
                      <Text className="text-red-600 font-semibold">Hủy đơn</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;
