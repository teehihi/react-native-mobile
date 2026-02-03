import React from 'react';
import { View, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../types/api';

const { width } = Dimensions.get('window');

interface CategorySliderProps {
  categories: Category[];
  onCategoryPress: (categoryName: string) => void;
  onViewAllPress: () => void;
}

// Icon mapping for categories
const getCategoryIcon = (categoryName: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const iconMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
    'Bánh Kẹo': 'candy',
    'Đặc Sản Miền Bắc': 'food-variant',
    'Đặc Sản Miền Trung': 'food-variant',
    'Đặc Sản Miền Nam': 'food-variant',
    'Nem Chua': 'food-drumstick',
    'Các Loại Mắm': 'bottle-wine',
    'Kẹo dừa': 'candy',
    'Trà & Café': 'coffee',
    'Đồ Khô': 'fish',
    'Gia Vị': 'shaker',
    'Quà Tặng': 'gift',
    'Trái Cây': 'fruit-cherries',
  };

  // Try exact match first
  if (iconMap[categoryName]) {
    return iconMap[categoryName];
  }

  // Try partial matches
  for (const [key, icon] of Object.entries(iconMap)) {
    if (categoryName.includes(key) || key.includes(categoryName)) {
      return icon;
    }
  }

  // Default icon
  return 'food-variant';
};

// Color mapping for categories
const getCategoryColor = (index: number): string => {
  const colors = [
    '#fbbf24', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
    '#10b981', // green
    '#ef4444', // red
    '#6b7280', // gray
  ];
  return colors[index % colors.length];
};

export const CategorySlider: React.FC<CategorySliderProps> = ({ 
  categories, 
  onCategoryPress, 
  onViewAllPress 
}) => {
  // Add "Xem Tất Cả" as the last item
  const allItems = [...categories, { name: 'Xem Tất Cả', isViewAll: true }];
  
  // Calculate pages (8 items per page: 2 rows x 4 columns)
  const itemsPerPage = 8;
  const pages = [];
  
  for (let i = 0; i < allItems.length; i += itemsPerPage) {
    pages.push(allItems.slice(i, i + itemsPerPage));
  }
  
  const containerWidth = width - 32; // Account for mx-4 margin
  const pageWidth = containerWidth - 32; // Account for container padding

  const renderCategoryItem = (item: any, index: number) => {
    const isViewAll = item.isViewAll;
    const globalIndex = categories.findIndex(cat => cat.name === item.name);
    const colorIndex = isViewAll ? 7 : globalIndex;
    
    return (
      <TouchableOpacity
        key={isViewAll ? 'view-all' : item.name}
        className="items-center mb-4"
        style={{ width: '25%' }}
        onPress={() => isViewAll ? onViewAllPress() : onCategoryPress(item.name)}
        activeOpacity={0.7}
      >
        <View 
          className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
          style={{ 
            backgroundColor: isViewAll ? '#6b728015' : getCategoryColor(colorIndex) + '15' 
          }}
        >
          <MaterialCommunityIcons 
            name={isViewAll ? 'apps' : getCategoryIcon(item.name)} 
            size={28} 
            color={isViewAll ? '#6b7280' : getCategoryColor(colorIndex)} 
          />
        </View>
        <Text 
          className="text-xs text-center text-gray-700 font-medium"
          numberOfLines={2}
          style={{ lineHeight: 14 }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white mx-4 rounded-2xl p-4 shadow-md" style={{ marginTop: -35 }}>
      <ScrollView 
        horizontal 
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'flex-start' }}
      >
        {pages.map((pageItems, pageIndex) => (
          <View 
            key={pageIndex}
            style={{ width: pageWidth }}
          >
            {/* First row (4 items) */}
            <View className="flex-row justify-between mb-4">
              {pageItems.slice(0, 4).map((item, index) => renderCategoryItem(item, index))}
              {/* Fill empty slots in first row */}
              {Array.from({ length: 4 - Math.min(pageItems.length, 4) }).map((_, emptyIndex) => (
                <View key={`empty-top-${emptyIndex}`} style={{ width: '25%' }} />
              ))}
            </View>
            
            {/* Second row (4 items) */}
            {pageItems.length > 4 && (
              <View className="flex-row justify-between">
                {pageItems.slice(4, 8).map((item, index) => renderCategoryItem(item, index + 4))}
                {/* Fill empty slots in second row */}
                {Array.from({ length: 4 - Math.min(pageItems.length - 4, 4) }).map((_, emptyIndex) => (
                  <View key={`empty-bottom-${emptyIndex}`} style={{ width: '25%' }} />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Page indicators */}
      {pages.length > 1 && (
        <View className="flex-row justify-center mt-3">
          {pages.map((_, index) => (
            <View
              key={index}
              className="w-2 h-2 rounded-full mx-1"
              style={{ backgroundColor: index === 0 ? '#16a34a' : '#d1d5db' }}
            />
          ))}
        </View>
      )}
    </View>
  );
};