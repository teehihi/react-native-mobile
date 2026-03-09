import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import { formatImageUrl } from '../../services/api';
import { useRoute, useNavigation } from '@react-navigation/native';

const OrderDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getOrderById(orderId);
      
      if (response.success && response.data) {
        setOrder(response.data.order);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy đơn hàng');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Load order error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus: OrderStatus) => {
    const steps = [
      { status: 'PENDING', label: 'Chờ xác nhận', icon: 'receipt-outline' },
      { status: 'CONFIRMED', label: 'Đã xác nhận', icon: 'checkmark-circle-outline' },
      { status: 'PROCESSING', label: 'Đang xử lý', icon: 'time-outline' },
      { status: 'SHIPPING', label: 'Đang giao hàng', icon: 'car-outline' },
      { status: 'DELIVERED', label: 'Đã giao', icon: 'checkmark-done-outline' },
    ];

    if (currentStatus === 'CANCELLED') {
      return [
        { status: currentStatus, label: 'Đã hủy', icon: 'close-circle-outline' },
      ];
    }

    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: index === currentIndex,
    }));
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const handleCancelOrder = () => {
    if (!order) return;

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

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#16a34a', '#15803d']} style={{ paddingTop: 0 }}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#16a34a' }}>
            <View className="px-4 py-4 flex-row items-center">
              <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Chi tiết đơn hàng</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#16a34a', '#15803d']} style={{ paddingTop: 0 }}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#16a34a' }}>
            <View className="px-4 py-4 flex-row items-center">
              <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Chi tiết đơn hàng</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Không tìm thấy đơn hàng</Text>
        </View>
      </View>
    );
  }

  const statusSteps = getStatusSteps(order.status);
  const canCancel = canCancelOrder(order);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#16a34a', '#15803d']} style={{ paddingTop: 0 }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#16a34a' }}>
          <View className="px-4 py-4 flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Chi tiết đơn hàng</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1">
        {/* Status Timeline */}
        <View className="bg-white p-4 mb-2">
          <Text className="font-bold text-gray-800 text-lg mb-4">Trạng thái đơn hàng</Text>
          
          {statusSteps.map((step, index) => (
            <View key={index} className="flex-row items-start mb-4">
              <View className="items-center mr-3">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    step.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={20}
                    color="white"
                  />
                </View>
                {index < statusSteps.length - 1 && (
                  <View className={`w-0.5 h-8 ${step.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </View>
              
              <View className="flex-1">
                <Text className={`font-semibold ${step.isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                  {step.label}
                </Text>
                {step.isCurrent && (
                  <Text className="text-sm text-gray-500 mt-1">
                    {formatDate(order.createdAt)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View className="bg-white p-4 mb-2">
          <Text className="font-bold text-gray-800 text-lg mb-3">Địa chỉ giao hàng</Text>
          <View className="flex-row items-start">
            <Ionicons name="location-outline" size={20} color="#6b7280" />
            <View className="ml-2 flex-1">
              <Text className="font-semibold text-gray-800">{order.shippingAddress.fullName}</Text>
              <Text className="text-gray-600 mt-1">{order.shippingAddress.phoneNumber}</Text>
              <Text className="text-gray-600 mt-1">
                {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
              </Text>
              {order.shippingAddress.note && (
                <Text className="text-gray-500 text-sm mt-2 italic">
                  Ghi chú: {order.shippingAddress.note}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Products */}
        <View className="bg-white p-4 mb-2">
          <Text className="font-bold text-gray-800 text-lg mb-3">Sản phẩm</Text>
          
          {order.items.map((item, index) => (
            <View key={index} className="flex-row mb-4 pb-4 border-b border-gray-200">
              <Image
                source={{ uri: formatImageUrl(item.productImage) }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
              
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-800" numberOfLines={2}>
                  {item.productName}
                </Text>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-gray-600">x{item.quantity}</Text>
                  <Text className="text-green-600 font-bold">
                    {formatPrice(item.price)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View className="bg-white p-4 mb-2">
          <Text className="font-bold text-gray-800 text-lg mb-3">Thanh toán</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Phương thức:</Text>
            <Text className="font-semibold text-gray-800">
              {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
            </Text>
          </View>
          
          <View className="flex-row justify-between pt-3 border-t border-gray-200">
            <Text className="font-bold text-gray-800 text-lg">Tổng cộng:</Text>
            <Text className="font-bold text-green-600 text-xl">
              {formatPrice(order.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Cancel Button */}
        {canCancel && (
          <View className="px-4 py-4">
            <TouchableOpacity
              className="bg-red-500 py-4 rounded-xl items-center"
              onPress={handleCancelOrder}
            >
              <Text className="text-white font-bold text-lg">Hủy đơn hàng</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen;
