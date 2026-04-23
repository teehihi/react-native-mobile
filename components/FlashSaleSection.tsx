import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../types/api';
import { getProductImage } from '../services/api';

const BG_FLASH_SALE = require('../assets/bgFlashSale.png');

const { width } = Dimensions.get('window');
const CARD_WIDTH = 150;

function useCountdownFromEndTime(endTime: string | null, onExpire?: () => void) {
  const calc = () => endTime ? Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)) : 0;
  const [remaining, setRemaining] = useState(calc);
  const expiredRef = React.useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    setRemaining(calc());
    const id = setInterval(() => {
      const r = calc();
      setRemaining(r);
      if (r === 0 && !expiredRef.current) {
        expiredRef.current = true;
        // Đợi 1s rồi gọi onExpire để backend kịp tạo slot mới
        setTimeout(() => onExpire?.(), 1000);
      }
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime]);

  const h = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  return { h, m, s };
}

const TimeBox: React.FC<{ value: string }> = ({ value }) => (
  <View style={{
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  }}>
    <Text style={{ color: '#f93b02', fontWeight: '900', fontSize: 13 }}>{value}</Text>
  </View>
);

interface Props {
  products: Product[];
  endTime: string | null;
  onProductPress?: (product: Product) => void;
  onExpire?: () => void;
}

export const FlashSaleSection: React.FC<Props> = ({ products, endTime, onProductPress, onExpire }) => {
  const { h, m, s } = useCountdownFromEndTime(endTime, onExpire);
  const flashProducts = products;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (!flashProducts.length) return null;

  const OVERLAP = 60;
  // Tỉ lệ ảnh gốc 1285x370, tính height theo width thực tế
  const headerWidth = width - 24; // marginHorizontal: 12 * 2
  const headerHeight = Math.round(headerWidth * 370 / 1285);

  return (
    <View style={{ marginHorizontal: 12, marginTop: 16, borderRadius: 16, backgroundColor: '#fff', overflow: 'visible' }}>
      {/* ── Header image ── */}
      <View style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
        <Image
          source={BG_FLASH_SALE}
          style={{ width: headerWidth, height: headerHeight }}
          resizeMode="contain"
        />
        {/* Xem thêm - góc trên phải */}
        <TouchableOpacity style={{
          position: 'absolute',
          right: 5,
          top: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Text style={{ color: '#f93b02', fontWeight: '700', fontSize: 13 }}>Xem thêm</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#f93b02" />
        </TouchableOpacity>

        {/* Countdown - góc trái dưới, dưới chữ FlashSale */}
        <View style={{
          position: 'absolute',
          left: 14,
          top: 40,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <TimeBox value={h} />
          <Text style={{ color: '#fff', fontWeight: '900', marginHorizontal: 3 }}>:</Text>
          <TimeBox value={m} />
          <Text style={{ color: '#fff', fontWeight: '900', marginHorizontal: 3 }}>:</Text>
          <TimeBox value={s} />
        </View>
      </View>

      {/* ── Products scroll đè lên header OVERLAP px ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 12 }}
        style={{ marginTop: -OVERLAP, paddingTop: 0 }}
      >
        {flashProducts.slice(0, 6).map((item, index) => (
          <TouchableOpacity
            key={`flash-${item.id}-${index}`}
            onPress={() => onProductPress?.(item)}
            activeOpacity={0.9}
            style={{
              width: CARD_WIDTH,
              marginRight: 10,
              marginTop: 8,
              backgroundColor: '#fff',
              borderRadius: 10,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 4,
              borderWidth: 1,
              borderColor: '#f0f0f0',
            }}
          >
            <View>
              <Image
                source={{ uri: getProductImage(item.imageUrl, item.category, item.name, item.id) }}
                style={{ width: CARD_WIDTH, height: 120 }}
                resizeMode="cover"
              />
              {item.discountPercentage ? (
                <View style={{
                  position: 'absolute', top: 6, left: 6,
                  backgroundColor: '#f93b02',
                  borderRadius: 6,
                  paddingHorizontal: 7, paddingVertical: 3,
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>
                    -{Math.round(Number(item.discountPercentage))}%
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={{ padding: 8 }}>
              <Text style={{ fontSize: 10, color: '#999', marginBottom: 2 }} numberOfLines={1}>
                {item.category?.toUpperCase() || ''}
              </Text>
              <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '800', color: '#111', lineHeight: 16, marginBottom: 4 }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#f93b02' }}>
                {formatPrice(item.price)}
              </Text>
              {item.originalPrice ? (
                <Text style={{ fontSize: 11, color: '#aaa', textDecorationLine: 'line-through' }}>
                  {formatPrice(item.originalPrice)}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        {/* Card thứ 7: Xem thêm */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: CARD_WIDTH * 0.6,
            marginRight: 10,
            marginTop: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: '#f93b02',
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <MaterialCommunityIcons name="chevron-right" size={28} color="#f93b02" />
          </View>
          <Text style={{ color: '#f93b02', fontSize: 12, fontWeight: '700' }}>Xem thêm</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
