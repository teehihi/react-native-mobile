import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from '../types/api';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 3; // 3 columns with padding

interface CategoryModalProps {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onCategoryPress: (categoryName: string) => void;
}

// Icon mapping for categories (same as CategorySlider)
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
    '#fbbf24', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', 
    '#10b981', '#ef4444', '#6b7280', '#3b82f6', '#f59e0b',
    '#8b5a2b', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
  ];
  return colors[index % colors.length];
};

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  categories,
  onClose,
  onCategoryPress
}) => {
  const handleCategoryPress = (categoryName: string) => {
    onCategoryPress(categoryName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-900">Tất Cả Danh Mục</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        <ScrollView className="flex-1 px-4 py-4">
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.name}
                className="items-center mb-6"
                style={{ width: ITEM_WIDTH }}
                onPress={() => handleCategoryPress(category.name)}
                activeOpacity={0.7}
              >
                <View 
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: getCategoryColor(index) + '20' }}
                >
                  <MaterialCommunityIcons 
                    name={getCategoryIcon(category.name)} 
                    size={28} 
                    color={getCategoryColor(index)} 
                  />
                </View>
                <Text 
                  className="text-xs text-gray-700 text-center font-medium"
                  numberOfLines={2}
                  style={{ lineHeight: 14 }}
                >
                  {category.name}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {category.productCount} sản phẩm
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};