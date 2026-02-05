import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';
import { NavigationProps } from '../../types/navigation';
import { Product } from '../../types/api';
import { ProductCard } from '../../components/ProductCard';

interface CategoryScreenProps extends NavigationProps {
  route: {
    params: {
      categoryName: string;
    };
  };
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation, route }) => {
  const { categoryName } = route.params;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [categoryName, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getProducts({
        category: categoryName,
        sort: sortBy,
        minPrice: priceRange.min > 0 ? priceRange.min : undefined,
        maxPrice: priceRange.max < 1000000 ? priceRange.max : undefined,
        limit: 50
      });

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        console.error('❌ Category products failed:', response?.message);
        setProducts([]);
      }
    } catch (error: any) {
      console.error('❌ Category products error:', error?.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProducts().finally(() => setRefreshing(false));
  }, [categoryName, sortBy, priceRange]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleSortChange = (newSort: 'newest' | 'price_asc' | 'price_desc') => {
    setSortBy(newSort);
    setShowFilters(false);
  };

  const applyPriceFilter = () => {
    setShowFilters(false);
    loadProducts();
  };

  const resetFilters = () => {
    setSortBy('newest');
    setPriceRange({ min: 0, max: 1000000 });
    setShowFilters(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard 
      product={item} 
      onPress={() => handleProductPress(item)}
      style={{ width: '48%', marginBottom: 16 }}
    />
  );

  const sortOptions: Array<{key: 'newest' | 'price_asc' | 'price_desc', label: string, icon: string}> = [
    { key: 'newest', label: 'Mới nhất', icon: 'clock-outline' },
    { key: 'price_asc', label: 'Giá thấp đến cao', icon: 'arrow-up' },
    { key: 'price_desc', label: 'Giá cao đến thấp', icon: 'arrow-down' },
  ];

  const priceRanges = [
    { min: 0, max: 50000, label: 'Dưới 50k' },
    { min: 50000, max: 100000, label: '50k - 100k' },
    { min: 100000, max: 200000, label: '100k - 200k' },
    { min: 200000, max: 1000000, label: 'Trên 200k' },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-green-600 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="mr-3"
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
                {categoryName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              className="ml-3"
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="filter-variant" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Product count */}
          <Text className="text-green-100 text-sm mt-1">
            {products.length} sản phẩm
          </Text>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View className="bg-white border-b border-gray-200 p-4">
            {/* Sort Options */}
            <Text className="font-semibold text-gray-900 mb-3">Sắp xếp theo</Text>
            <View className="flex-row flex-wrap mb-4">
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleSortChange(option.key)}
                  className={`flex-row items-center mr-4 mb-2 px-3 py-2 rounded-full border ${
                    sortBy === option.key 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-gray-100 border-gray-300'
                  }`}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name={option.icon as any} 
                    size={16} 
                    color={sortBy === option.key ? '#16a34a' : '#6b7280'} 
                  />
                  <Text className={`ml-2 text-sm ${
                    sortBy === option.key ? 'text-green-700 font-medium' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <Text className="font-semibold text-gray-900 mb-3">Khoảng giá</Text>
            <View className="flex-row flex-wrap mb-4">
              {priceRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setPriceRange({ min: range.min, max: range.max })}
                  className={`mr-3 mb-2 px-3 py-2 rounded-full border ${
                    priceRange.min === range.min && priceRange.max === range.max
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-gray-100 border-gray-300'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm ${
                    priceRange.min === range.min && priceRange.max === range.max
                      ? 'text-green-700 font-medium' 
                      : 'text-gray-700'
                  }`}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter Actions */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 mr-2 py-2 px-4 border border-gray-300 rounded-lg"
                activeOpacity={0.7}
              >
                <Text className="text-center text-gray-700 font-medium">Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyPriceFilter}
                className="flex-1 ml-2 py-2 px-4 bg-green-600 rounded-lg"
                activeOpacity={0.7}
              >
                <Text className="text-center text-white font-medium">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Products Grid */}
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }} // Extra space for shadow
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <MaterialCommunityIcons name="package-variant" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-lg mt-4">Không có sản phẩm nào</Text>
              <Text className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc</Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
};

export default CategoryScreen;