import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Product as ApiProduct } from '../../types/api';
import { ApiService, getProductImage } from '../../services/api';
import { NavigationProps } from '../../types/navigation';
import { stripHtmlTags } from '../../utils/textUtils';

interface FilterState {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  sortBy: 'newest' | 'price_asc' | 'price_desc';
  sortOrder: 'asc' | 'desc';
}

interface SearchScreenProps extends NavigationProps {
  route?: {
    params?: {
      initialQuery?: string;
      category?: string;
    };
  };
}

const SearchScreen: React.FC<SearchScreenProps> = ({ route, navigation }) => {
  const initialQuery = route?.params?.initialQuery || '';
  const initialCategory = route?.params?.category || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    categories: initialCategory ? [initialCategory] : [],
    priceRange: { min: 0, max: 1000000 },
    rating: 0,
    sortBy: 'newest',
    sortOrder: 'desc',
  });

  // Set initial query when component mounts
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [searchQuery, filters]);

  const loadCategories = async () => {
    try {
      const response = await ApiService.getCategories();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        console.error('❌ Categories failed:', response?.message || 'Unknown error');
        setCategories([]);
      }
    } catch (error: any) {
      console.error('❌ Categories error:', error?.message || 'Network error');
      setCategories([]);
    }
  };

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery || undefined,
        minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
        maxPrice: filters.priceRange.max < 1000000 ? filters.priceRange.max : undefined,
        category: filters.categories.length > 0 ? filters.categories[0] : undefined,
        sort: getSortParam(),
        page,
        limit: 20,
      };

      const response = await ApiService.getProducts(params);
      
      if (response.success && response.data) {
        setProducts(response.data);
        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            totalPages: response.pagination.totalPages,
            totalItems: response.pagination.totalItems,
          });
        }
      } else {
        console.error('❌ Products failed:', response?.message || 'Unknown error');
        setProducts([]);
      }
    } catch (error: any) {
      console.error('❌ Products error:', error?.message || 'Network error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortParam = (): 'newest' | 'price_asc' | 'price_desc' => {
    return filters.sortBy;
  };

  const toggleCategoryFilter = (categoryName: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(name => name !== categoryName)
        : [categoryName] // Only allow one category for now
    }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 1000000 },
      rating: 0,
      sortBy: 'newest',
      sortOrder: 'desc',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderProduct = ({ item }: { item: ApiProduct }) => {
    // Remove HTML tags from description
    const cleanDescription = stripHtmlTags(item.description);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image 
          source={{ uri: getProductImage(item.imageUrl, item.category, item.name, item.id) }} 
          style={styles.productImage} 
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>{cleanDescription}</Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={(e) => {
              e.stopPropagation();
              // TODO: Add to cart logic
            }}
          >
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.addToCartText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Bộ Lọc</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Danh Mục</Text>
            <View style={styles.categoryGrid}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    filters.categories.includes(category) && styles.categoryChipActive
                  ]}
                  onPress={() => toggleCategoryFilter(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    filters.categories.includes(category) && styles.categoryChipTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Khoảng Giá</Text>
            <View style={styles.priceRangeContainer}>
              <TouchableOpacity
                style={[
                  styles.priceRangeButton,
                  filters.priceRange.max <= 100000 && styles.priceRangeButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, priceRange: { min: 0, max: 100000 } }))}
              >
                <Text style={styles.priceRangeText}>Dưới 100k</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceRangeButton,
                  filters.priceRange.min === 100000 && filters.priceRange.max === 300000 && styles.priceRangeButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, priceRange: { min: 100000, max: 300000 } }))}
              >
                <Text style={styles.priceRangeText}>100k - 300k</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceRangeButton,
                  filters.priceRange.min >= 300000 && styles.priceRangeButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, priceRange: { min: 300000, max: 1000000 } }))}
              >
                <Text style={styles.priceRangeText}>Trên 300k</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Đánh Giá</Text>
            <View style={styles.ratingFilter}>
              {[4.5, 4.0, 3.5, 3.0].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    filters.rating === rating && styles.ratingButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, rating }))}
                >
                  <View style={styles.ratingButtonContent}>
                    <Ionicons name="star" size={16} color="#fbbf24" />
                    <Text style={styles.ratingButtonText}>{rating}+ sao</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sắp Xếp</Text>
            <View style={styles.sortContainer}>
              {[
                { key: 'newest', label: 'Mới nhất' },
                { key: 'price_asc', label: 'Giá thấp đến cao' },
                { key: 'price_desc', label: 'Giá cao đến thấp' }
              ].map(sort => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.sortButton,
                    filters.sortBy === sort.key && styles.sortButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({ 
                    ...prev, 
                    sortBy: sort.key as any,
                  }))}
                >
                  <Text style={[
                    styles.sortButtonText,
                    filters.sortBy === sort.key && styles.sortButtonTextActive
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Đặt Lại</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.applyButton} 
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>Áp Dụng ({pagination.totalItems})</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm đặc sản..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color="#374151" />
          {(filters.categories.length > 0 || filters.rating > 0) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {pagination.totalItems} sản phẩm
        </Text>
        {(searchQuery || filters.categories.length > 0 || filters.rating > 0) && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            resetFilters();
          }}>
            <Text style={styles.clearAll}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
              <Text style={styles.emptyDescription}>
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </Text>
            </View>
          }
        />
      )}

      <FilterModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  clearAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  productsList: {
    padding: 16,
    paddingBottom: 100, // Add extra padding for tab bar
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 2,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  addToCartText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priceRangeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  priceRangeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  priceRangeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingFilter: {
    gap: 8,
  },
  ratingButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  ratingButtonActive: {
    backgroundColor: '#3b82f6',
  },
  ratingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  sortContainer: {
    gap: 8,
  },
  sortButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  sortButtonActive: {
    backgroundColor: '#3b82f6',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sortButtonTextActive: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default SearchScreen;
