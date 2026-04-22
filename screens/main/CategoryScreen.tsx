import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Text, StatusBar, FlatList, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';
import { NavigationProps } from '../../types/navigation';
import { Product } from '../../types/api';
import { ProductGlassCard } from '../../components/ProductGlassCard';

interface CategoryScreenProps extends NavigationProps {
  route: {
    params: {
      categoryName: string;
      categoryId?: number | string;
    };
  };
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation, route }) => {
  const { categoryName, categoryId } = route.params;
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('newest');

  useEffect(() => {
    loadProducts(true);
  }, [categoryName, categoryId]);

  const loadProducts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setProducts([]);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const categoryParam = categoryId ? categoryId.toString() : categoryName;
      
      const response = await ApiService.getProducts({
        category: categoryParam,
        page: currentPage,
        limit: 20
      });

      if (response.success && response.data) {
        const newProducts = response.data;
        
        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }

        setHasMore(newProducts.length === 20);
        
        if (!reset) {
          setPage(currentPage + 1);
        }
      } else {
        if (reset) setProducts([]);
      }
    } catch (error: any) {
      if (reset) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts(true).finally(() => setRefreshing(false));
  }, [categoryName, categoryId]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(false);
    }
  };

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { product });
  }, [navigation]);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductGlassCard 
      product={item} 
      onPress={() => handleProductPress(item)}
      style={{ flex: 1, marginHorizontal: 6, marginBottom: 16, maxWidth: '47%' }}
    />
  ), [handleProductPress]);

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    if (activeFilter === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  }, [products, activeFilter]);

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top || 16 }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {categoryName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Đang tải...' : `${products.length} sản phẩm`}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]} 
          activeOpacity={0.8}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons 
            name={showFilters ? "close" : "filter-variant"} 
            size={showFilters ? 22 : 20} 
            color={showFilters ? "white" : "#111827"} 
            style={showFilters ? { marginTop: 2 } : {}}
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['newest', 'price_asc', 'price_desc'].map((filterType) => {
              const labels: Record<string, string> = {
                newest: 'Mới nhất',
                price_asc: 'Giá thấp → cao',
                price_desc: 'Giá cao → thấp'
              };
              const isActive = activeFilter === filterType;
              return (
                <TouchableOpacity
                  key={filterType}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filterType)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {labels[filterType]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B14F" />
      
      {renderHeader()}

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="loading" size={32} color="#00B14F" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={sortedProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <MaterialCommunityIcons name="loading" size={24} color="#00B14F" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <MaterialCommunityIcons name="package-variant" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Darker background to make white cards pop
  },
  headerContainer: {
    backgroundColor: '#00B14F', // Grab Green
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  filterButton: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)', // Translucent white
    // Removed border to avoid offset issues
  },
  filterPanel: {
    backgroundColor: '#00B14F',
    paddingTop: 16,
    paddingBottom: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#E8F5E9', // Light green bg
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  filterChipText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#00B14F',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 15,
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default CategoryScreen;