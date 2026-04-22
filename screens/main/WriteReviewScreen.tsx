import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiService, getProductImage } from '../../services/api';

const WriteReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, productId, productName, productImage, category } = route.params as {
    orderId: number; productId: number; productName: string; productImage: string; category?: string;
  };

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSubmitting(true);
    try {
      const res = await ApiService.createReview({ productId, orderId, rating, comment });
      if (res.success && res.data) {
        Alert.alert(
          '🎉 Đánh giá thành công!',
          `Bạn nhận được:\n• ${res.data.reward.points} điểm tích lũy\n• Mã giảm giá: ${res.data.reward.couponCode}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể gửi đánh giá');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#16a34a', '#15803d']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Đánh giá sản phẩm</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Product info */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Image 
            source={{ 
              uri: getProductImage(
                productImage || '',
                category || '',
                productName,
                productId
              )
            }} 
            style={{ width: 64, height: 64, borderRadius: 8 }} 
          />
          <Text style={{ flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#1f2937' }} numberOfLines={2}>{productName}</Text>
        </View>

        {/* Rating stars */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>Chất lượng sản phẩm</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={40} color={star <= rating ? '#fbbf24' : '#d1d5db'} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>
            {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][rating]}
          </Text>
        </View>

        {/* Comment */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>Nhận xét của bạn</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            multiline
            numberOfLines={5}
            style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 14, color: '#1f2937', minHeight: 120, textAlignVertical: 'top' }}
          />
        </View>

        {/* Reward info */}
        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#bbf7d0' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a', marginBottom: 8 }}>🎁 Phần thưởng khi đánh giá</Text>
          <Text style={{ fontSize: 13, color: '#15803d' }}>• +500 điểm tích lũy</Text>
          <Text style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>• Mã giảm giá 10% (tối đa 50.000đ)</Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{ borderRadius: 12, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={submitting ? ['#9ca3af', '#6b7280'] : ['#16a34a', '#15803d']}
            style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            {submitting ? <ActivityIndicator color="white" /> : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Gửi đánh giá</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default WriteReviewScreen;
