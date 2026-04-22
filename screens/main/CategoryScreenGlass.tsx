import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';
import { NavigationProps } from '../../types/navigation';
import { Product } from '../../types/api';
import { ProductGlassCard } from '../../components/ProductGlassCard';
import { CategoryGlassChip } from '../../components/CategoryGlassChip';
import { GlassLoadingSkeleton } from '../../components/GlassLoadingSkeleton';

const { width } = Dimensions.get('window');

interface CategoryScreenGlassProps extends NavigationProps {
  route: {
    params: {
      categoryName: string;
      categoryId?: number | string;
    };
  };
}

const CategoryScreenGlass = ({
  navigation,
  route,
}: CategoryScreenGlassProps) => {
  const { categoryName, categoryId } = route.params;
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>(
    'newest'
  );
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000000,
  });
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions: Array<{
    key: 'newest' | 'price_asc' | 'price_desc';
    label: string;
    icon: string;
  }> = [
    { key: 'newest', label: 'Mới nhất', icon: 'clock-outline' },
    { key: 'price_asc', label: 'Giá thấp → cao', icon: 'arrow-up' },
    { key: 'price_desc', label: 'Giá cao → thấp', icon: 'arrow-down' },
  ];

  const priceRanges = [
    { min: 0, max: 50000, label: 'Dưới 50k' },
    { min: 50000, max: 100000, label: '50k - 100k' },
    { min: 100000, max: 200000, label: '100k - 200k' },
    { min: 200000, max: 1000000, label: 'Trên 200k' },
  ];

  useEffect(() => {
    loadProducts(true);
  }, [categoryName, categoryId, sortBy]);

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
        sort: sortBy,
        minPrice: priceRange.min > 0 ? priceRange.min : undefined,
        maxPrice: priceRange.max < 1000000 ? priceRange.max : undefined,
        page: currentPage,
        limit: 20,
      });

      if (response.success && response.data) {
        const newProducts = response.data;

        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }

        setHasMore(newProducts.length === 20);

        if (!reset) {
          setPage(currentPage + 1);
        }
      } else {
        console.error('❌ Category products failed:', response?.message);
        if (reset) setProducts([]);
      }
    } catch (error: any) {
      console.error('❌ Category products error:', error?.message);
      if (reset) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProducts(true).finally(() => setRefreshing(false));
  }, [categoryName, categoryId, sortBy, priceRange]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(false);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleSortChange = (newSort: 'newest' | 'price_asc' | 'price_desc') => {
    setSortBy(newSort);
  };

  const applyPriceFilter = () => {
    setShowFilters(false);
    loadProducts(true);
  };

  const resetFilters = () => {
    setSortBy('newest');
    setPriceRange({ min: 0, max: 1000000 });
    setShowFilters(false);
    loadProducts(true);
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productWrapper, index % 2 === 0 && styles.productLeft]}>
      <ProductGlassCard product={item} onPress={() => handleProductPress(item)} />
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Filter Chips - No background box, individual glass chips */}
      <View style={styles.filterChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {sortOptions.map((option) => (
            <CategoryGlassChip
              key={option.key}
              label={option.label}
              isSelected={sortBy === option.key}
              onPress={() => handleSortChange(option.key)}
            />
          ))}
        </ScrollView>

        {/* Filter Button - Circular glass button */}
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButtonWrapper}
        >
          <LiquidGlassView
            effect="regular"
            tintColor={showFilters ? 'rgba(0, 177, 79, 0.15)' : 'rgba(255, 255, 255, 0.4)'}
            colorScheme="light"
            style={styles.filterButton}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color={showFilters ? '#00B14F' : '#6B7280'}
            />
          </LiquidGlassView>
        </TouchableOpacity>
      </View>

      {/* Price Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <LiquidGlassView
            effect="regular"
            tintColor="rgba(255, 255, 255, 0.95)"
            colorScheme="light"
            style={styles.filterPanelGlass}
          >
            <Text style={styles.filterTitle}>Khoảng giá</Text>
            <View style={styles.priceRangeContainer}>
              {priceRanges.map((range, index) => (
                <CategoryGlassChip
                  key={index}
                  label={range.label}
                  isSelected={priceRange.min === range.min && priceRange.max === range.max}
                  onPress={() => setPriceRange({ min: range.min, max: range.max })}
                />
              ))}
            </View>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                onPress={resetFilters}
                style={styles.filterActionButton}
              >
                <LiquidGlassView
                  effect="regular"
                  tintColor="rgba(255, 255, 255, 0.4)"
                  colorScheme="light"
                  style={styles.filterActionGlass}
                >
                  <Text style={styles.resetButtonText}>Đặt lại</Text>
                </LiquidGlassView>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyPriceFilter}
                style={styles.filterActionButton}
              >
                <LiquidGlassView
                  effect="regular"
                  tintColor="rgba(0, 177, 79, 0.15)"
                  colorScheme="light"
                  style={styles.filterActionGlass}
                >
                  <Text style={styles.applyButtonText}>Áp dụng</Text>
                </LiquidGlassView>
              </TouchableOpacity>
            </View>
          </LiquidGlassView>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LiquidGlassView
        effect="regular"
        tintColor="rgba(255, 255, 255, 0.5)"
        colorScheme="light"
        style={styles.emptyGlass}
      >
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={64}
            color="#9ca3af"
          />
        </View>
        <Text style={styles.emptyTitle}>Không có sản phẩm</Text>
        <Text style={styles.emptySubtitle}>
          Hiện chưa có sản phẩm nào trong danh mục này
        </Text>
        <TouchableOpacity onPress={resetFilters} style={styles.emptyButton}>
          <LiquidGlassView
            effect="regular"
            tintColor="rgba(255, 255, 255, 0.5)"
            colorScheme="light"
            style={styles.emptyButtonGlass}
          >
            <Text style={styles.emptyButtonText}>Xóa bộ lọc</Text>
          </LiquidGlassView>
        </TouchableOpacity>
      </LiquidGlassView>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LiquidGlassView
          effect="regular"
          tintColor="rgba(255, 255, 255, 0.5)"
          colorScheme="light"
          style={styles.footerLoaderGlass}
        >
          <MaterialCommunityIcons name="loading" size={24} color="#00B14F" />
          <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
        </LiquidGlassView>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#00B14F" />
      <View style={styles.container}>
        {/* Header with SafeArea */}
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <LiquidGlassView
            effect="regular"
            tintColor="rgba(0, 177, 79, 0.92)"
            colorScheme="light"
            style={styles.glassHeader}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {categoryName}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {products.length} sản phẩm
                </Text>
              </View>
            </View>
          </LiquidGlassView>
        </View>

        {/* Products List */}
        {loading ? (
          <ScrollView style={styles.content}>
            <GlassLoadingSkeleton />
            <GlassLoadingSkeleton />
            <GlassLoadingSkeleton />
          </ScrollView>
        ) : (
          <FlatList
            data={products}
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
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            style={styles.content}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9', // Soft gray background for depth
  },
  // Header with SafeArea
  headerContainer: {
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  glassHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    // Strong shadow for separation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  // Filter chips container
  filterChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F4F6F9',
  },
  chipsScrollContent: {
    paddingRight: 8,
  },
  filterButtonWrapper: {
    marginLeft: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  filterPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterPanelGlass: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  filterTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterActionButton: {
    flex: 1,
  },
  filterActionGlass: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00B14F',
    letterSpacing: -0.2,
  },
  listContent: {
    paddingBottom: 120,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: (width - 48) / 2,
  },
  productLeft: {
    marginRight: 8,
  },
  emptyContainer: {
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyGlass: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    width: '100%',
  },
  emptyButtonGlass: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 177, 79, 0.5)',
    backgroundColor: 'rgba(0, 177, 79, 0.08)',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00B14F',
    letterSpacing: -0.2,
  },
  footerLoader: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  footerLoaderGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 177, 79, 0.4)',
    backgroundColor: 'rgba(0, 177, 79, 0.05)',
  },
  footerLoaderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});

export default CategoryScreenGlass;
