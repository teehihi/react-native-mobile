import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { ApiService } from '../../services/api';
import { API_HOST_REAL_DEVICE, API_PORT } from '@env';

interface AccountScreenProps {
  navigation: any;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showCollapsedHeader, setShowCollapsedHeader] = useState(false);

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      const host = API_HOST_REAL_DEVICE || 'localhost';
      const port = API_PORT || '3001';
      return `http://${host}:${port}${user.avatarUrl}`;
    }
    return null;
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Even if API call fails, still logout locally
              logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          },
        },
      ]
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowCollapsedHeader(offsetY > 30);
      },
    }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [30, 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });



  const MenuItem = ({ icon, title, onPress, badge }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <MaterialCommunityIcons name={icon} size={24} color="#333" />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && <Text style={styles.badge}>{badge}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f59e0b" translucent={false} />
      
      {/* Fixed Back Button */}
      <View style={styles.fixedBackButton}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Collapsed Header - Appears on scroll */}
      {showCollapsedHeader && (
        <Animated.View style={[styles.collapsedHeader, { opacity: headerOpacity }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.collapsedBackButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.collapsedHeaderTitle}>{user?.fullName || user?.username}</Text>
        </Animated.View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header Background */}
        <LinearGradient
          colors={['#FFF1B8', '#FFD38A', '#FFB55E', '#FFA24A']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.headerBackground}
        />


        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userCardContent}>
            <View style={styles.userInfo}>
              {getAvatarUrl() ? (
                <Image source={{ uri: getAvatarUrl()! }} style={styles.cardAvatar} />
              ) : (
                <View style={styles.cardAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#f59e0b" />
                </View>
              )}
              <Text style={styles.cardUserName}>{user?.fullName || user?.username}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButtonCard}
              onPress={() => navigation.navigate('ProfileEdit')}
              activeOpacity={0.8}
            >
              <Text style={styles.profileButtonCardText}>Hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* Mini Badges */}
          <View style={styles.miniBadges}>
            <View style={styles.miniBadge}>
              <MaterialCommunityIcons name="ticket-percent" size={20} color="#f59e0b" />
              <Text style={styles.miniBadgeText}>Quyền lợi hội viên</Text>
            </View>
            <View style={styles.miniBadge}>
              <MaterialCommunityIcons name="crown" size={20} color="#eab308" />
              <Text style={styles.miniBadgeText}>Theo dõi tiến độ</Text>
            </View>
          </View>
        </View>

        {/* Main Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mục chính</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="wallet"
              title="Ví của tôi"
              onPress={() => {}}
            />
            <MenuItem
              icon="plus-circle"
              title="Thêm phương thức thanh toán"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="briefcase"
              title="Trung tâm Doanh nghiệp"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ưu đãi và tiết kiệm</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="gift"
              title="DacSanVietXu"
              badge="245 DacSanVietXu"
              onPress={() => {}}
            />
            <MenuItem
              icon="account-group"
              title="Gói Hội Viên"
              onPress={() => {}}
            />
            <MenuItem
              icon="calendar-check"
              title="Thử thách"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quát</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="heart"
              title="Yêu thích"
              onPress={() => {}}
            />
            <MenuItem
              icon="silverware-fork-knife"
              title="Chế độ ăn uống"
              onPress={() => {}}
            />
            <MenuItem
              icon="credit-card"
              title="Phương thức thanh toán"
              onPress={() => {}}
            />
            <MenuItem
              icon="cog"
              title="Cài đặt"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.logoutItem} 
              onPress={handleLogout} 
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <MaterialCommunityIcons name="logout" size={24} color="#dc2626" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  collapsedBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  collapsedHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerBackground: {
    backgroundColor: '#f59e0b',
    height: 190,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  fixedBackButton: {
    position: 'absolute',
    top: 75,
    left: 16,
    zIndex: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -60,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  cardAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  profileButtonCard: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileButtonCardText: {
    color: '#00897b',
    fontSize: 14,
    fontWeight: '600',
  },
  miniBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  miniBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  miniBadgeText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 15,
    color: '#dc2626',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default AccountScreen;
