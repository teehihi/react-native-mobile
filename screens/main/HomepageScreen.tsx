import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { ApiService } from '../../services/api';
import { NavigationProps } from '../../types/navigation';
import { Product, Category } from '../../types/api';
import { HomepageHeader } from '../../components/HomepageHeader';
import { CategorySlider } from '../../components/CategorySlider';
import { BestSellersSection } from '../../components/BestSellersSection';
import { ProductSection } from '../../components/ProductSection';
import { PromoBanner } from '../../components/PromoBanner';
import { DiscountedProductsSection } from '../../components/DiscountedProductsSection';
import { CategoryModal } from '../../components/CategoryModal';

interface HomepageScreenProps extends NavigationProps {}

const HomepageScreen: React.FC<HomepageScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadProducts(),
      loadCategories(),
      loadBestSellers(),
      loadDiscountedProducts()
    ]);
  };

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

  const loadCategories = async () => {
    try {
      const response = await ApiService.getCategoriesWithProducts();
      
      if (response.success && response.data) {
        setCategories(response.data || []);
      } else {
        console.error('❌ Categories failed:', response?.message || 'Unknown error');
        setCategories([]);
      }
    } catch (error: any) {
      console.error('❌ Categories error:', error?.message || 'Network error');
      setCategories([]);
    }
  };

  const loadBestSellers = async () => {
    try {
      const response = await ApiService.getBestSellers(10);
      
      if (response.success && response.data) {
        setBestSellers(response.data || []);
      } else {
        console.error('❌ Best sellers failed:', response?.message || 'Unknown error');
        setBestSellers([]);
      }
    } catch (error: any) {
      console.error('❌ Best sellers error:', error?.message || 'Network error');
      setBestSellers([]);
    }
  };

  const loadDiscountedProducts = async () => {
    try {
      const response = await ApiService.getDiscountedProducts(20);
      
      if (response.success && response.data) {
        setDiscountedProducts(response.data || []);
      } else {
        console.error('❌ Discounted products failed:', response?.message || 'Unknown error');
        setDiscountedProducts([]);
      }
    } catch (error: any) {
      console.error('❌ Discounted products error:', error?.message || 'Network error');
      setDiscountedProducts([]);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAllData().finally(() => setRefreshing(false));
  }, []);

  const handleSearchSubmit = (query: string) => {
    navigation.navigate('Search', { initialQuery: query });
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCategoryPress = (categoryName: string) => {
    // Navigate to Category screen
    (navigation as any).navigate('Category', { categoryName });
  };

  const handleViewAllCategories = () => {
    setShowCategoryModal(true);
  };

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
            <CategorySlider 
              categories={categories}
              onCategoryPress={handleCategoryPress}
              onViewAllPress={handleViewAllCategories}
            />
            <PromoBanner />
            <BestSellersSection 
              products={bestSellers}
              onProductPress={handleProductPress}
            />
            <ProductSection 
              title="Mua Ngay" 
              products={products} 
              onProductPress={handleProductPress} 
            />
            <DiscountedProductsSection 
              products={discountedProducts}
              onProductPress={handleProductPress}
            />
          </View>
        </ScrollView>

        <CategoryModal
          visible={showCategoryModal}
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onCategoryPress={handleCategoryPress}
        />
      </SafeAreaView>
    </>
  );
};

export default HomepageScreen;