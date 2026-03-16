import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '../types/api';
import { formatImageUrl, ApiService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../store/cartStore';
import { useNotificationStore } from '../store/notificationStore';


interface HomepageHeaderProps {
  user: User | null;
  onAvatarPress: () => void;
  onSearchSubmit: (query: string) => void;
  onCartPress: () => void;
  onNotificationPress: () => void;
}

export const HomepageHeader: React.FC<HomepageHeaderProps> = ({ user, onAvatarPress, onSearchSubmit, onCartPress, onNotificationPress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();
  const { unreadCount, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    ApiService.getUnreadCount().then(res => {
      if (res.success && res.data) setUnreadCount(res.data.count || 0);
    }).catch(() => {});
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      return formatImageUrl(user.avatarUrl);
    }
    return null;
  };

  return (
    <LinearGradient
      colors={['#6FD39B', '#63CBB0', '#5BC3C8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height: 200 }}  
    >
      <View className="px-4 pt-16 pb-16">
        {/* Top Row: QR, Search, Icons */}
        <View className="flex-row items-center mb-3">
          {/* QR Scanner */}
          <TouchableOpacity 
            className="w-11 h-11 bg-white/20 rounded-xl items-center justify-center mr-3"
            activeOpacity={0.7}
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="white" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View 
            className="flex-1 bg-white rounded-2xl flex-row items-center px-4 py-2"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
              height: 40,
            }}
          >
            <TouchableOpacity onPress={handleSearchSubmit}>
              <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TextInput
              className="flex-1 ml-3 text-gray-700 text-sm"
              placeholder="Tìm món"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              style={{
                fontWeight: '500',
                height: 36,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Cart Icon */}
          <TouchableOpacity 
            className="items-center justify-center ml-3"
            onPress={onCartPress}
            activeOpacity={0.7}
            style={{ width: 44, height: 44 }}
          >
            <MaterialCommunityIcons name="cart-outline" size={26} color="white" />
            {cartCount > 0 && (
              <View style={{
                position: 'absolute', top: 2, right: 2,
                backgroundColor: '#ef4444', borderRadius: 10,
                minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
                paddingHorizontal: 3, borderWidth: 1.5, borderColor: 'white',
              }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Bell Icon */}
          <TouchableOpacity
            className="items-center justify-center ml-3"
            onPress={onNotificationPress}
            activeOpacity={0.7}
            style={{ width: 44, height: 44 }}
          >
            <MaterialCommunityIcons name="bell-outline" size={26} color="white" />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute', top: 2, right: 2,
                backgroundColor: '#ef4444', borderRadius: 10,
                minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
                paddingHorizontal: 3, borderWidth: 1.5, borderColor: 'white',
              }}>
                <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* User Avatar */}          <TouchableOpacity 
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-white ml-2"
            onPress={onAvatarPress}
            activeOpacity={0.7}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            {getAvatarUrl() ? (
              <Image 
                source={{ uri: getAvatarUrl()! }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-white items-center justify-center">
                <MaterialCommunityIcons name="account" size={22} color="#16a34a" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* User Greeting */}
        <View className="px-1">
          <Text className="text-white/90 text-sm mb-0.5">Xin chào,</Text>
          <Text className="text-white text-lg font-bold">
            {user?.fullName || user?.username || 'Khách'}
          </Text>
        </View>
      </View>
      
    </LinearGradient>
  );
};
