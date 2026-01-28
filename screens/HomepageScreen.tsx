import React, { useState } from 'react';
import { ScrollView, RefreshControl, Alert, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { ApiService } from '../services/api';
import { NavigationProps } from '../types/navigation';
import { PRODUCTS } from '../services/mockData';
import { HomepageHeader } from '../components/HomepageHeader';
import { ServiceGrid } from '../components/ServiceGrid';
import { ProductSection } from '../components/ProductSection';
import { UserProfileModal } from '../components/UserProfileModal';
import { PromoBanner } from '../components/PromoBanner';
import { RecommendationSection } from '../components/RecommendationSection';

interface HomepageScreenProps extends NavigationProps {}

const HomepageScreen: React.FC<HomepageScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.logout();
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          } catch (error) {
            console.log('Logout error:', error);
          }
        },
      },
    ]);
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
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <SafeAreaView className="flex-1 bg-green-600" edges={[]}>
        <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />
        }
      >
        <HomepageHeader user={user} onAvatarPress={() => setShowUserModal(true)} />
        <View className="bg-gray-50 flex-1">
          <ServiceGrid services={services} />
          <PromoBanner />
          <ProductSection title="Mua Ngay" products={PRODUCTS} />
          <ProductSection title="Đặt lại" products={PRODUCTS} />
          <RecommendationSection products={PRODUCTS} />
        </View>
      </ScrollView>

      <UserProfileModal
        visible={showUserModal}
        user={user}
        onClose={() => setShowUserModal(false)}
        onLogout={handleLogout}
      />
      </SafeAreaView>
    </>
  );
};

export default HomepageScreen;