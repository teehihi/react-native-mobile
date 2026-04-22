import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, Share, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Product as ApiProduct } from '../../types/api';
import { getProductImage } from '../../services/api';
import { stripHtmlTags } from '../../utils/textUtils';
import { useCartStore } from '../../store/cartStore';
import { ApiService } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';
import { ProductDetailBottomBar } from '../../components/ProductDetailBottomBar';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: { params: { product: ApiProduct } };
}

const ProductDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { product: initialProduct } = route.params;
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<ApiProduct>(initialProduct);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<ApiProduct[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Build product images array from available images
  const productImages = React.useMemo(() => {
    const images: string[] = [];
    
    // Priority 1: Use images from product_images table if available
    if (product.images && product.images.length > 0) {
      console.log('📸 Using images from product_images table:', product.images.length);
      product.images.forEach(img => {
        images.push(getProductImage(img.imageUrl, product.category, product.name, product.id));
      });
      return images;
    }
    
    // Priority 2: Use main image and story image
    if (product.imageUrl) {
      images.push(getProductImage(product.imageUrl, product.category, product.name, product.id));
    }
    
    if (product.storyImageUrl && product.storyImageUrl !== product.imageUrl) {
      images.push(getProductImage(product.storyImageUrl, product.category, product.name, product.id));
    }
    
    // If we have 0 images, add a placeholder
    if (images.length === 0) {
      images.push(getProductImage('', product.category, product.name, product.id));
    }
    
    return images;
  }, [product.images, product.imageUrl, product.storyImageUrl, product.category, product.name, product.id]);

  useEffect(() => {
    // Load full product detail with images
    loadProductDetail();
    // Track view
    ApiService.trackProductView(product.id);
    // Load reviews, stats, similar, favorite status
    loadReviews();
    loadSimilar();
    loadFavoriteStatus();
  }, [product.id]);

  const loadProductDetail = async () => {
    try {
      setLoadingDetail(true);
      const res = await ApiService.getProductById(product.id);
      if (res.success && res.data) {
        console.log('✅ Loaded product detail with images:', res.data.images?.length || 0);
        setProduct(res.data);
      }
    } catch (error) {
      console.error('❌ Failed to load product detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await ApiService.getProductReviews(product.id);
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setReviewStats(res.data.stats);
      }
    } catch {}
    finally { setLoadingReviews(false); }
  };

  const loadSimilar = async () => {
    try {
      const res = await ApiService.getSimilarProducts(product.id, 6);
      if (res.success && res.data) setSimilarProducts(res.data);
    } catch {}
  };

  const loadFavoriteStatus = async () => {
    try {
      const res = await ApiService.checkFavoriteStatus(product.id);
      if (res.success && res.data) setIsFavorite(res.data.isLiked);
    } catch {}
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await ApiService.toggleFavorite(product.id);
      if (res.success && res.data) setIsFavorite(res.data.liked);
    } catch {}
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleShare = async () => {
    try {
      await Share.share({ message: `Xem sản phẩm ${product.name} - ${formatPrice(product.price)}` });
    } catch {}
  };

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, product.name, product.imageUrl, product.price, product.originalPrice, product.category);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng', [
        { text: 'Tiếp tục mua sắm', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart' as never) },
      ]);
    } catch { Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng'); }
  };

  const handleBuyNow = async () => {
    try {
      await addItem(product.id, product.name, product.imageUrl, product.price, product.originalPrice, product.category);
      navigation.navigate('Cart' as never);
    } catch { Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng'); }
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#ef4444' : '#374151'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Images */}
        <View style={styles.imageContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setSelectedImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
            {productImages.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.productImage} resizeMode="cover" />
            ))}
          </ScrollView>
          {productImages.length > 1 && (
            <View style={styles.imageIndicators}>
              {productImages.map((_, i) => (
                <View key={i} style={[styles.indicator, selectedImageIndex === i && styles.activeIndicator]} />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.ratingStars}>
              {[1,2,3,4,5].map(s => (
                <Ionicons key={s} name="star" size={14} color={s <= Math.floor(parseFloat(reviewStats?.avgRating || product.rating || 0)) ? '#fbbf24' : '#e5e7eb'} />
              ))}
              <Text style={styles.ratingText}>{reviewStats?.avgRating || product.rating || '0'}</Text>
            </View>
            <Text style={styles.statDivider}>|</Text>
            <Text style={styles.statText}>{reviewStats?.reviewCount || 0} đánh giá</Text>
            <Text style={styles.statDivider}>|</Text>
            <Text style={styles.statText}>{reviewStats?.buyerCount || (product as any).soldQuantity || 0} đã mua</Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>{formatPrice(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{stripHtmlTags(product.description)}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đặc điểm nổi bật</Text>
            {['100% nguyên liệu tự nhiên', 'Không chất bảo quản', 'Đóng gói kín, bảo quản tốt', 'Giao hàng toàn quốc'].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#10b981" />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá ({reviewStats?.reviewCount || 0})</Text>
            </View>
            {loadingReviews ? (
              <ActivityIndicator color="#16a34a" style={{ marginVertical: 16 }} />
            ) : reviews.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
            ) : (
              reviews.slice(0, 3).map((r, i) => (
                <View key={i} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{(r.user_name || r.username || 'U')[0].toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{r.user_name || r.username}</Text>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {[1,2,3,4,5].map(s => (
                          <Ionicons key={s} name="star" size={12} color={s <= r.rating ? '#fbbf24' : '#e5e7eb'} />
                        ))}
                      </View>
                    </View>
                    {r.is_verified_buyer === 1 && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Đã mua</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))
            )}
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={[styles.section, { marginHorizontal: -16, paddingHorizontal: 16, backgroundColor: '#f9fafb', paddingTop: 20, paddingBottom: 4 }]}>
              <Text style={styles.sectionTitle}>Sản phẩm tương tự</Text>
              <View style={styles.similarGrid}>
                {similarProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onPress={() => navigation.push('ProductDetail', { product: p })}
                    style={{ width: (width - 44) / 2 }}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Liquid Glass Bottom Bar */}
      <ProductDetailBottomBar
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        price={product.price}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', gap: 8 },
  scrollView: { flex: 1 },
  imageContainer: { position: 'relative' },
  productImage: { width, height: width },
  imageIndicators: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  activeIndicator: { backgroundColor: '#fff' },
  productInfo: { padding: 16 },
  productName: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8, lineHeight: 30 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 },
  ratingStars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 13, color: '#6b7280', marginLeft: 4 },
  statDivider: { color: '#d1d5db', fontSize: 12 },
  statText: { fontSize: 13, color: '#6b7280' },
  priceSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  currentPrice: { fontSize: 26, fontWeight: '700', color: '#dc2626' },
  originalPrice: { fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#fecaca' },
  discountText: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  featureText: { fontSize: 14, color: '#374151' },
  emptyText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  reviewItem: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: 'white', fontWeight: '700', fontSize: 14 },
  reviewName: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  verifiedBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verifiedText: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  reviewComment: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  similarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});

export default ProductDetailScreen;
