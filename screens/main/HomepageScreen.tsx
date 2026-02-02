import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { ApiService } from '../../services/api';
import { NavigationProps } from '../../types/navigation';
import { Product } from '../../types/api';
import { HomepageHeader } from '../../components/HomepageHeader';
import { ServiceGrid } from '../../components/ServiceGrid';
import { ProductSection } from '../../components/ProductSection';
import { PromoBanner } from '../../components/PromoBanner';
import { RecommendationSection } from '../../components/RecommendationSection';

interface HomepageScreenProps extends NavigationProps {}

const HomepageScreen: React.FC<HomepageScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await ApiService.getProducts({ limit: 12 });
      
      if (response.success && response.data) {
        setProducts(response.data || []);
      } else {
        console.error('❌ Homepage products failed:', response?.message || 'Unknown error');
        setProducts([]);
      }
    } catch (error: any) {
      console.error('❌ Homepage error:', error?.message || 'Network error');
      setProducts([]);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProducts().finally(() => setRefreshing(false));
  }, []);

  const handleSearchSubmit = (query: string) => {
    // Navigate to Search screen with the query
    navigation.navigate('Search', { initialQuery: query });
  };

  const handleProductPress = (product: any) => {
    navigation.navigate('ProductDetail', { product });
  };

  // Service grid items
  const services = [
    { id: 1, name: 'Bánh Kẹo', icon: 'candy', color: '#fbbf24' },
    { id: 2, name: 'Trà & Café', icon: 'coffee', color: '#8b5cf6' },
    { id: 3, name: 'Đồ Khô', icon: 'fish', color: '#06b6d4' },
    { id: 4, name: 'Gia Vị', icon: 'shaker', color: '#f97316' },
    { id: 5, name: 'Quà Tặng', icon: 'gift', color: '#ec4899' },
    { id: 6, name: 'Đặc Sản', icon: 'food-variant', color: '#10b981' },
    { id: 7, name: 'Trái Cây', icon: 'fruit-cherries', color: '#ef4444' },
    { id: 8, name: 'Xem Tất Cả', icon: 'apps', color: '#6b7280' },
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView className="flex-1 bg-green-600" edges={[]}>
        <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />
        }
      >
        <HomepageHeader 
          user={user} 
          onAvatarPress={() => (navigation as any).navigate('Profile')}
          onSearchSubmit={handleSearchSubmit}
        />
        <View className="bg-gray-50 flex-1">
          <ServiceGrid services={services} />
          <PromoBanner />
          <ProductSection title="Mua Ngay" products={products} onProductPress={handleProductPress} />
          <ProductSection title="Đặt lại" products={products} onProductPress={handleProductPress} />
          <RecommendationSection products={products} onProductPress={handleProductPress} />
        </View>
      </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default HomepageScreen;