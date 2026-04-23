import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';

// Đặt thời gian kết thúc flash sale: 24h từ lúc mở app
const FLASH_SALE_DURATION_SECONDS = 24 * 60 * 60;

function useCountdown(totalSeconds: number) {
  const [endTime] = useState(() => Date.now() + totalSeconds * 1000);
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setRemaining(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const h = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  return { h, m, s };
}

const TimeBox: React.FC<{ value: string }> = ({ value }) => (
  <View style={{
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: 'center',
  }}>
    <Text style={{ color: '#f93b02', fontWeight: '800', fontSize: 14, lineHeight: 18 }}>
      {value}
    </Text>
  </View>
);

const Colon: React.FC = () => (
  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, marginHorizontal: 2 }}>:</Text>
);

export const PromoBanner: React.FC = () => {
  const { h, m, s } = useCountdown(FLASH_SALE_DURATION_SECONDS);

  return (
    <View className="px-4 mt-6">
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          backgroundColor: '#f93b02',
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          {/* Left: logo + title + countdown */}
          <View style={{ flex: 1 }}>
            {/* FlashSale logo + title row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Image
                source={require('../assets/iconFlashSale.png')}
                style={{ width: 36, height: 36, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 22, letterSpacing: 1 }}>
                FLASH SALE
              </Text>
            </View>

            {/* Countdown */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 12, marginRight: 8, fontWeight: '600' }}>
                Kết thúc sau
              </Text>
              <TimeBox value={h} />
              <Colon />
              <TimeBox value={m} />
              <Colon />
              <TimeBox value={s} />
            </View>

            {/* Discount badge */}
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 3,
              alignSelf: 'flex-start',
              marginTop: 10,
            }}>
              <Text style={{ color: '#f93b02', fontWeight: '800', fontSize: 12 }}>
                Giảm đến 50%
              </Text>
            </View>
          </View>

          {/* Right: assassin image */}
          <Image
            source={require('../assets/assasinFlashSale.png')}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
