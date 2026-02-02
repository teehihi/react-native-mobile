// Utility functions for image handling

/**
 * Get placeholder image URL based on product category
 * @param category - Product category
 * @param productName - Product name for fallback
 * @returns Placeholder image URL
 */
export const getPlaceholderImage = (category: string, productName?: string): string => {
  // Use Unsplash for high-quality food images
  const baseUrl = 'https://images.unsplash.com';
  
  // Category-based placeholder images
  const categoryImages: { [key: string]: string } = {
    'Bánh Kẹo': `${baseUrl}/400x300/?cake,dessert,sweet`,
    'Đặc Sản Miền Bắc': `${baseUrl}/400x300/?vietnamese,food,traditional`,
    'Đặc Sản Miền Trung': `${baseUrl}/400x300/?vietnamese,food,central`,
    'Đặc Sản Miền Nam': `${baseUrl}/400x300/?vietnamese,food,southern`,
    'Nem Chua': `${baseUrl}/400x300/?vietnamese,spring,roll`,
    'Các Loại Mắm': `${baseUrl}/400x300/?sauce,condiment,vietnamese`,
    'Kẹo dừa': `${baseUrl}/400x300/?coconut,candy,sweet`,
    'Trà & Café': `${baseUrl}/400x300/?tea,coffee,drink`,
    'Đồ Khô': `${baseUrl}/400x300/?dried,food,snack`,
    'Gia Vị': `${baseUrl}/400x300/?spices,seasoning,herbs`,
    'Quà Tặng': `${baseUrl}/400x300/?gift,box,present`,
    'Trái Cây': `${baseUrl}/400x300/?fruit,fresh,tropical`,
  };

  // Try to find category match
  for (const [cat, url] of Object.entries(categoryImages)) {
    if (category.includes(cat)) {
      return url;
    }
  }

  // Fallback based on product name keywords
  if (productName) {
    const name = productName.toLowerCase();
    if (name.includes('bánh')) return categoryImages['Bánh Kẹo'];
    if (name.includes('nem')) return categoryImages['Nem Chua'];
    if (name.includes('mắm')) return categoryImages['Các Loại Mắm'];
    if (name.includes('kẹo')) return categoryImages['Bánh Kẹo'];
    if (name.includes('trà') || name.includes('cà phê')) return categoryImages['Trà & Café'];
  }

  // Default Vietnamese food image
  return `${baseUrl}/400x300/?vietnamese,food,delicious`;
};

/**
 * Get image URL with fallback to placeholder
 * @param imageUrl - Original image URL
 * @param category - Product category
 * @param productName - Product name
 * @returns Image URL or placeholder
 */
export const getImageWithFallback = (imageUrl: string | null | undefined, category: string, productName?: string): string => {
  // If no image URL, return placeholder
  if (!imageUrl) {
    return getPlaceholderImage(category, productName);
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // For now, return placeholder since local images don't exist
  // In production, you would check if the file exists first
  return getPlaceholderImage(category, productName);
};

/**
 * Generate a consistent placeholder based on product ID
 * @param productId - Product ID
 * @param category - Product category
 * @returns Consistent placeholder image URL
 */
export const getConsistentPlaceholder = (productId: number, category: string): string => {
  const seed = productId.toString();
  const baseUrl = 'https://picsum.photos/seed';
  
  // Use product ID as seed for consistent images
  return `${baseUrl}/${seed}/400/300`;
};