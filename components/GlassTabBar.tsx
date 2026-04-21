import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, Text, Animated, PanResponder, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40;
const TAB_HEIGHT = 68;
const PILL_HEIGHT = 52;
const PILL_WIDTH = 80;

interface TabLayout {
  x: number;
  width: number;
  centerX: number;
}

const getIcon = (routeName: string, isFocused: boolean) => {
  const icons: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Search: { active: 'magnify', inactive: 'magnify' },
    Orders: { active: 'clipboard-text', inactive: 'clipboard-text-outline' },
    Profile: { active: 'account', inactive: 'account-outline' },
  };
  return isFocused ? icons[routeName]?.active : icons[routeName]?.inactive;
};

const getLabel = (routeName: string) => {
  const labels: Record<string, string> = {
    Home: 'Trang chủ',
    Search: 'Tìm kiếm',
    Orders: 'Đơn hàng',
    Profile: 'Tài khoản',
  };
  return labels[routeName] ?? routeName;
};

const TabIcon = React.memo(({ routeName, isFocused }: { routeName: string; isFocused: boolean }) => {
  const scale = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1 : 0.95,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, scale, opacity]);

  const activeColor = '#007AFF';
  const inactiveColor = '#8E8E93';

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <MaterialCommunityIcons
        name={getIcon(routeName, isFocused) as any}
        size={24}
        color={isFocused ? activeColor : inactiveColor}
      />
    </Animated.View>
  );
});

export const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  const routeCount = state.routes.length;
  
  // Store measured layouts for each tab
  const [tabLayouts, setTabLayouts] = useState<TabLayout[]>([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const dragOffset = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);

  // Calculate pill position based on measured tab layouts
  const getPillPosition = (index: number): number => {
    if (tabLayouts.length === 0 || !tabLayouts[index]) {
      // Fallback: equal distribution
      const tabWidth = TAB_BAR_WIDTH / routeCount;
      return index * tabWidth + (tabWidth - PILL_WIDTH) / 2;
    }
    
    const layout = tabLayouts[index];
    // Center pill relative to tab item
    return layout.centerX - PILL_WIDTH / 2;
  };

  // Handle tab layout measurement
  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    const centerX = x + width / 2;
    
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width, centerX };
      return newLayouts;
    });
  };

  // Pan responder for drag gesture with liquid morphing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Liquid stretch effect
        Animated.parallel([
          Animated.spring(scaleX, {
            toValue: 1.2,
            damping: 10,
            stiffness: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleY, {
            toValue: 0.85,
            damping: 10,
            stiffness: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderMove: (_, gestureState) => {
        dragOffset.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        
        if (tabLayouts.length === 0) {
          dragOffset.setValue(0);
          return;
        }

        // Find nearest tab based on current position
        const currentPillCenter = getPillPosition(state.index) + PILL_WIDTH / 2 + gestureState.dx;
        let nearestIndex = state.index;
        let minDistance = Infinity;

        tabLayouts.forEach((layout, index) => {
          const distance = Math.abs(layout.centerX - currentPillCenter);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        });

        dragOffset.setValue(0);

        // Liquid bounce back
        Animated.parallel([
          Animated.spring(scaleX, {
            toValue: 1,
            damping: 12,
            stiffness: 180,
            useNativeDriver: true,
          }),
          Animated.spring(scaleY, {
            toValue: 1,
            damping: 12,
            stiffness: 180,
            useNativeDriver: true,
          }),
        ]).start();

        if (nearestIndex !== state.index) {
          const route = state.routes[nearestIndex];
          if (route) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate(route.name);
          }
        }
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        dragOffset.setValue(0);
        Animated.parallel([
          Animated.spring(scaleX, { toValue: 1, useNativeDriver: true }),
          Animated.spring(scaleY, { toValue: 1, useNativeDriver: true }),
        ]).start();
      },
    })
  ).current;

  // Animate pill to centered position when tab changes
  useEffect(() => {
    if (!isDragging && tabLayouts.length > 0) {
      const targetPosition = getPillPosition(state.index);
      
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: targetPosition,
          damping: 16,
          stiffness: 120,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleX, {
          toValue: 1,
          damping: 12,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleY, {
          toValue: 1,
          damping: 12,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.index, tabLayouts, isDragging]);

  const currentRoute = state.routes[state.index];
  const routeName = getFocusedRouteNameFromRoute(currentRoute) ?? '';
  const hideTabBar = ['Checkout', 'AddressList', 'AddAddress', 'OrderDetail', 'ProductDetail', 'Cart'].includes(routeName);

  const handleTabPress = (index: number, route: any, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  if (hideTabBar) {
    return null;
  }

  const renderActivePill = () => {
    const pillTranslateX = isDragging
      ? Animated.add(translateX, dragOffset)
      : translateX;

    return (
      <Animated.View 
        style={[
          styles.activePill,
          { 
            width: PILL_WIDTH,
            transform: [
              { translateX: pillTranslateX },
              { scaleX },
              { scaleY }
            ]
          }
        ]}
      >
        {/* Inner glow */}
        <View style={styles.pillGlow} />
        {/* Top highlight */}
        <View style={styles.pillHighlight} />
      </Animated.View>
    );
  };

  const renderContent = () => (
    <View style={styles.content} {...panResponder.panHandlers}>
      {renderActivePill()}
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <View 
            key={index} 
            style={styles.tabItemContainer}
            onLayout={(event) => handleTabLayout(index, event)}
          >
            <TouchableOpacity
              onPress={() => handleTabPress(index, route, isFocused)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <TabIcon routeName={route.name} isFocused={isFocused} />
              <Text 
                style={[
                  styles.tabLabel, 
                  isFocused && styles.tabLabelActive
                ]}
              >
                {String(getLabel(route.name))}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );

  const containerPaddingBottom = Math.max(insets.bottom - 4, 12);

  return (
    <View style={[styles.wrapper, { paddingBottom: containerPaddingBottom }]}>
      <View style={styles.glassWrapper}>
        {/* Soft shadow underneath */}
        <View style={styles.shadowLayer} />
        
        {Platform.OS === 'ios' && isLiquidGlassSupported ? (
          <LiquidGlassView 
            effect="clear"
            interactive={false}
            style={styles.glassContainer}
          >
            {/* White overlay for premium glass look */}
            <View style={styles.whiteOverlay} />
            {/* Top light reflection */}
            <View style={styles.topReflection} />
            {renderContent()}
          </LiquidGlassView>
        ) : (
          <BlurView intensity={100} tint="light" style={styles.glassContainer}>
            <View style={styles.whiteOverlay} />
            <View style={styles.topReflection} />
            {renderContent()}
          </BlurView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  glassWrapper: {
    width: TAB_BAR_WIDTH,
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 36,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glassContainer: {
    height: TAB_HEIGHT,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  topReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItemContainer: {
    flex: 1,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 3,
    fontWeight: '500',
    opacity: 0.6,
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
    opacity: 1,
  },
  activePill: {
    position: 'absolute',
    height: PILL_HEIGHT,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    zIndex: 1,
    top: (TAB_HEIGHT - PILL_HEIGHT) / 2,
    left: 0,
  },
  pillGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  pillHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
