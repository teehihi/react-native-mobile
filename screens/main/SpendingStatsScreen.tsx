import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ApiService } from '../../services/api';

const { width } = Dimensions.get('window');

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const STAT_CARDS = [
  { key: 'pendingAmount',   countKey: 'pendingCount',   label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fffbeb', icon: 'clock-outline' },
  { key: 'shippingAmount',  countKey: 'shippingCount',  label: 'Đang giao',    color: '#3b82f6', bg: '#eff6ff', icon: 'truck-delivery-outline' },
  { key: 'deliveredAmount', countKey: 'deliveredCount', label: 'Đã giao',      color: '#16a34a', bg: '#f0fdf4', icon: 'check-circle-outline' },
  { key: 'cancelledAmount', countKey: 'cancelledCount', label: 'Đã huỷ',       color: '#ef4444', bg: '#fef2f2', icon: 'close-circle-outline' },
];

const SpendingStatsScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const res = await ApiService.getSpendingStats();
      if (res.success && res.data) setStats(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  // Bar chart helpers
  const maxAmount = stats?.monthlySpending?.length
    ? Math.max(...stats.monthlySpending.map((m: any) => m.amount), 1)
    : 1;

  const formatMonth = (m: string) => {
    const [y, mo] = m.split('-');
    return `T${parseInt(mo)}`;
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
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>Thống kê dòng tiền</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : !stats ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>Không thể tải dữ liệu</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStats(); }} colors={['#16a34a']} />}
        >
          {/* Summary card */}
          <LinearGradient colors={['#16a34a', '#15803d']} style={{ marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 }}>Tổng chi tiêu</Text>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '800' }}>{formatCurrency(stats.totalSpent)}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 6 }}>{stats.totalOrders} đơn hàng</Text>
          </LinearGradient>

          {/* Status breakdown */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 16, gap: 8 }}>
            {STAT_CARDS.map((card) => (
              <View key={card.key} style={{
                width: (width - 40) / 2,
                backgroundColor: card.bg,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: `${card.color}22`,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name={card.icon as any} size={18} color={card.color} />
                  <Text style={{ fontSize: 12, color: card.color, fontWeight: '600', marginLeft: 6 }}>{card.label}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
                  {formatCurrency(stats[card.key] || 0)}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {stats[card.countKey] || 0} đơn
                </Text>
              </View>
            ))}
          </View>

          {/* Monthly chart */}
          {stats.monthlySpending?.length > 0 && (
            <View style={{ backgroundColor: 'white', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 16 }}>Chi tiêu 6 tháng gần nhất</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 }}>
                {stats.monthlySpending.map((m: any, i: number) => {
                  const barH = Math.max(8, (m.amount / maxAmount) * 100);
                  return (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>
                        {m.amount >= 1000000 ? `${(m.amount / 1000000).toFixed(1)}M` : `${Math.round(m.amount / 1000)}K`}
                      </Text>
                      <View style={{
                        width: '100%', height: barH,
                        backgroundColor: '#16a34a', borderRadius: 4,
                        opacity: 0.7 + (i / stats.monthlySpending.length) * 0.3,
                      }} />
                      <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{formatMonth(m.month)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
};

export default SpendingStatsScreen;
