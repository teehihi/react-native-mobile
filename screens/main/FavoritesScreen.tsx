import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ApiService, getProductImage } from '../../services/api';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const res = await ApiService.getFavorites();
      if (res.success && res.data) setFavorites(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadFavorites(); }, []));

  const handleRemove = async (productId: number) => {
    await ApiService.toggleFavorite(productId);
    setFavorites(prev => prev.filter(p => p.id !== productId));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{ backgroundColor: 'white', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, flexDirection: 'row', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
      onPress={() => navigation.navigate('ProductDetail' as never, { product: item } as never)}
    >
      <Image 
        source={{ 
          uri: getProductImage(
            item.image_url || item.imageUrl || '',
            item.category_name || item.category || '',
            item.name,
            item.id
          )
        }} 
        style={{ width: 80, height: 80, borderRadius: 8 }} 
      />
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }} numberOfLines={2}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>{item.category_name}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#16a34a' }}>{formatPrice(item.discount_price || item.price)}</Text>
          {item.discount_percent > 0 && (
            <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ fontSize: 11, color: '#dc2626', fontWeight: '600' }}>-{item.discount_percent}%</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.id)} style={{ padding: 4 }}>
        <Ionicons name="heart" size={24} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#16a34a', '#15803d']}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>Yêu thích</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{favorites.length} sản phẩm</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Ionicons name="heart-outline" size={64} color="#d1d5db" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 16 }}>Chưa có sản phẩm yêu thích</Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>Nhấn vào biểu tượng tim trên sản phẩm để thêm vào đây</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFavorites(); }} colors={['#16a34a']} />}
        />
      )}
    </View>
  );
};

export default FavoritesScreen;
