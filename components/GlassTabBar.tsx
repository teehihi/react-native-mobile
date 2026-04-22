import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Text,
  Animated,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let LiquidGlassView: any = null;
let LiquidGlassContainerView: any = null;
let AnimatedLiquidGlassView: any = null;
let isLiquidGlassSupported = false;

try {
  const liquidGlass = require('@callstack/liquid-glass');
  LiquidGlassView = liquidGlass.LiquidGlassView;
  LiquidGlassContainerView = liquidGlass.LiquidGlassContainerView;
  isLiquidGlassSupported = liquidGlass.isLiquidGlassSupported || false;
  // Tạo animated version để dùng transform trực tiếp mà không cần Animated.View wrapper
  if (LiquidGlassView) {
    AnimatedLiquidGlassView = Animated.createAnimatedComponent(LiquidGlassView);
  }
} catch (e) {}

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40;
const TAB_HEIGHT = 68;
const PILL_HEIGHT = 54;
const PILL_WIDTH = 84;

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

export const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const routeCount = state.routes.length;

  const [tabLayouts, setTabLayouts] = useState<TabLayout[]>([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const ghostX = useRef(new Animated.Value(0)).current;       // vị trí pill cũ
  const ghostOpacity = useRef(new Animated.Value(0)).current; // ẩn khi không drag
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const dragOffset = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [ghostLeft, setGhostLeft] = useState(0);
  const tintAnim = useRef(new Animated.Value(0)).current;
  // currentDragX: vị trí center của pill đang kéo (relative to tab bar)
  const currentDragX = useRef(0);

  // Tính index nào đang bị pill overlap — icon nào pill đang đè lên thì active
  const getOverlappingIndices = (pillLeft: number): number[] => {
    const layouts = tabLayoutsRef.current;
    const pillRight = pillLeft + PILL_WIDTH;
    const result: number[] = [];
    for (let i = 0; i < layouts.length; i++) {
      const layout = layouts[i];
      if (!layout) continue;
      // Overlap nếu pill và tab có giao nhau
      if (pillLeft < layout.x + layout.width && pillRight > layout.x) {
        result.push(i);
      }
    }
    return result;
  };

  // Track latest values in refs for use inside PanResponder
  const tabLayoutsRef = useRef<TabLayout[]>([]);
  const stateIndexRef = useRef(state.index);
  const hoveredIndexRef = useRef<number | null>(null);

  useEffect(() => { tabLayoutsRef.current = tabLayouts; }, [tabLayouts]);
  useEffect(() => { stateIndexRef.current = state.index; }, [state.index]);
  useEffect(() => { hoveredIndexRef.current = hoveredIndex; }, [hoveredIndex]);

  const getPillPosition = (index: number): number => {
    const layouts = tabLayoutsRef.current;
    if (layouts.length === 0 || !layouts[index]) {
      const tabWidth = TAB_BAR_WIDTH / routeCount;
      return index * tabWidth + (tabWidth - PILL_WIDTH) / 2;
    }
    return layouts[index].centerX - PILL_WIDTH / 2;
  };

  const getNearestIndex = (dx: number): number => {
    const layouts = tabLayoutsRef.current;
    const currentIdx = stateIndexRef.current;
    if (layouts.length === 0) {
      const avgTabWidth = TAB_BAR_WIDTH / routeCount;
      return Math.max(0, Math.min(routeCount - 1, currentIdx + Math.round(dx / avgTabWidth)));
    }
    const currentCenter = getPillPosition(currentIdx) + PILL_WIDTH / 2;
    const droppedCenter = currentCenter + dx;
    let nearest = currentIdx;
    let minDist = Infinity;
    layouts.forEach((layout, i) => {
      const dist = Math.abs(layout.centerX - droppedCenter);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    return nearest;
  };

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width: w } = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const next = [...prev];
      next[index] = { x, width: w, centerX: x + w / 2 };
      return next;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderGrant: () => {
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const pos = getPillPosition(stateIndexRef.current);
        setGhostLeft(pos);
        ghostX.setValue(pos);
        Animated.timing(ghostOpacity, { toValue: 1, duration: 80, useNativeDriver: true }).start();
        // Rainbow tint loop
        tintAnim.setValue(0);
        Animated.loop(
          Animated.timing(tintAnim, { toValue: 1, duration: 1200, useNativeDriver: false })
        ).start();
        Animated.parallel([
          Animated.spring(scaleX, { toValue: 1.4, damping: 8, stiffness: 180, useNativeDriver: true }),
          Animated.spring(scaleY, { toValue: 1.4, damping: 8, stiffness: 180, useNativeDriver: true }),
        ]).start();
      },
      onPanResponderMove: (_, g) => {
        dragOffset.setValue(g.dx);

        // Tính vị trí left của pill đang kéo
        const basePillLeft = getPillPosition(stateIndexRef.current);
        const currentPillLeft = basePillLeft + g.dx;
        currentDragX.current = currentPillLeft;

        // Icon nào pill đang overlap thì active
        const overlapping = getOverlappingIndices(currentPillLeft);
        // Ưu tiên tab gần center pill nhất
        const nearest = getNearestIndex(g.dx);
        const newHovered = overlapping.includes(nearest) ? nearest
          : overlapping.length > 0 ? overlapping[overlapping.length - 1]
          : nearest;

        if (newHovered !== hoveredIndexRef.current) {
          setHoveredIndex(newHovered);
          if (newHovered !== stateIndexRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      },
      onPanResponderRelease: (_, g) => {
        const nearest = getNearestIndex(g.dx);
        
        // Reset tất cả ngay lập tức, không animation
        setIsDragging(false);
        setHoveredIndex(null);
        ghostOpacity.setValue(0);
        tintAnim.stopAnimation();
        dragOffset.setValue(0);
        scaleX.setValue(1);
        scaleY.setValue(1);

        if (nearest !== stateIndexRef.current && nearest >= 0 && nearest < routeCount) {
          const route = state.routes[nearest];
          if (route) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate(route.name);
          }
        }
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        setHoveredIndex(null);
        ghostOpacity.setValue(0);
        tintAnim.stopAnimation();
        dragOffset.setValue(0);
        scaleX.setValue(1);
        scaleY.setValue(1);
      },
    })
  ).current;

  // Animate pill khi tab thay đổi
  useEffect(() => {
    if (!isDragging && tabLayouts.length > 0) {
      Animated.spring(translateX, {
        toValue: getPillPosition(state.index),
        damping: 16,
        stiffness: 120,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }
  }, [state.index, tabLayouts, isDragging]);

  const currentRoute = state.routes[state.index];
  const routeName = getFocusedRouteNameFromRoute(currentRoute) ?? '';
  const hideTabBar = ['Checkout', 'AddressList', 'AddAddress', 'OrderDetail', 'ProductDetail', 'Cart'].includes(routeName);
  if (hideTabBar) return null;

  const handleTabPress = (index: number, route: any, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const pillTranslateX = isDragging ? Animated.add(translateX, dragOffset) : translateX;

  const renderPills = () => {
    const pillStyle = {
      width: PILL_WIDTH,
      height: PILL_HEIGHT,
      borderRadius: 26,
    };

    if (Platform.OS === 'ios' && isLiquidGlassSupported && AnimatedLiquidGlassView && LiquidGlassContainerView) {
      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <LiquidGlassContainerView spacing={48} style={StyleSheet.absoluteFill}>
            {/* Ghost pill tại vị trí cũ - dùng AnimatedLiquidGlassView trực tiếp để native merge hoạt động */}
            <AnimatedLiquidGlassView
              effect="clear"
              interactive={false}
              style={[
                styles.pillAbsolute,
                {
                  width: PILL_WIDTH,
                  height: PILL_HEIGHT,
                  borderRadius: 26,
                  opacity: ghostOpacity,
                  transform: [{ translateX: ghostX }],
                }
              ]}
            />
            {/* Main pill theo ngón tay */}
            <AnimatedLiquidGlassView
              effect="clear"
              interactive={false}
              style={[
                styles.pillAbsolute,
                {
                  width: PILL_WIDTH,
                  height: PILL_HEIGHT,
                  borderRadius: 26,
                  transform: [{ translateX: pillTranslateX }, { scaleX }, { scaleY }],
                }
              ]}
            />
          </LiquidGlassContainerView>
        </View>
      );
    }

    // Fallback BlurView
    return (
      <>
        <Animated.View style={[
          styles.pillAbsolute,
          styles.pillFallback,
          pillStyle,
          { transform: [{ translateX: pillTranslateX }, { scaleX }, { scaleY }] }
        ]} />
        <Animated.View style={[
          styles.pillAbsolute,
          styles.pillFallbackGhost,
          pillStyle,
          { opacity: ghostOpacity, transform: [{ translateX: ghostX }] }
        ]} />
      </>
    );
  };

  const containerPaddingBottom = Math.max(insets.bottom - 4, 12);

  return (
    <View style={[styles.wrapper, { paddingBottom: containerPaddingBottom }]}>
      <View style={styles.glassWrapper}>
        <View style={styles.shadowLayer} />

        {Platform.OS === 'ios' && isLiquidGlassSupported && AnimatedLiquidGlassView && LiquidGlassContainerView ? (
          <View style={styles.glassContainer} {...panResponder.panHandlers}>
            {/* Nav bar background */}
            <LiquidGlassView
              effect="regular"
              interactive={false}
              style={[StyleSheet.absoluteFill, { borderRadius: 36 }]}
            />

            {/* Tab icons — trên pill khi idle, dưới pill khi drag */}
            <View style={[styles.content, { zIndex: isDragging ? 1 : 3 }]}>
              {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                // Khi drag: active nếu pill đang overlap icon này
                const overlapping = isDragging
                  ? getOverlappingIndices(currentDragX.current)
                  : [];
                const isActive = isDragging
                  ? overlapping.includes(index)
                  : isFocused;
                return (
                  <View
                    key={index}
                    style={styles.tabItemContainer}
                    onLayout={(e) => handleTabLayout(index, e)}
                  >
                    <TouchableOpacity
                      onPress={() => handleTabPress(index, route, isFocused)}
                      style={styles.tabButton}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={getIcon(route.name, isActive) as any}
                        size={26}
                        color={isActive ? '#007AFF' : '#8E8E93'}
                      />
                      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                        {getLabel(route.name)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Pills — dưới icons khi idle (zIndex 2), trên icons khi drag (zIndex 4) */}
            <LiquidGlassContainerView spacing={48} style={[StyleSheet.absoluteFill, { zIndex: isDragging ? 4 : 2 }]} pointerEvents="none">
              {/* Ghost pill */}
              <AnimatedLiquidGlassView
                effect="regular"
                interactive={false}
                style={[
                  styles.pillAbsolute,
                  {
                    width: PILL_WIDTH,
                    height: PILL_HEIGHT,
                    borderRadius: 26,
                    left: ghostLeft,
                    opacity: ghostOpacity,
                  }
                ]}
              />
              {/* Main pill */}
              {isDragging ? (
                <AnimatedLiquidGlassView
                  key="pill-drag"
                  effect="clear"
                  interactive={true}
                  style={[
                    styles.pillAbsolute,
                    {
                      width: PILL_WIDTH,
                      height: PILL_HEIGHT,
                      borderRadius: 26,
                      transform: [{ translateX: pillTranslateX }, { scaleX }, { scaleY }],
                    }
                  ]}
                />
              ) : (
                <AnimatedLiquidGlassView
                  key="pill-idle"
                  effect="regular"
                  interactive={false}
                  style={[
                    styles.pillAbsolute,
                    {
                      width: PILL_WIDTH,
                      height: PILL_HEIGHT,
                      borderRadius: 26,
                      transform: [{ translateX: pillTranslateX }],
                    }
                  ]}
                />
              )}
            </LiquidGlassContainerView>
          </View>
        ) : (
          <BlurView intensity={80} tint="light" style={styles.glassContainer}>
            <View style={styles.whiteOverlay} />
            <View style={styles.topReflection} />
            <View style={styles.content} {...panResponder.panHandlers}>
              {renderPills()}
              {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const isActive = isDragging
                  ? hoveredIndex === index
                  : isFocused;
                return (
                  <View
                    key={index}
                    style={styles.tabItemContainer}
                    onLayout={(e) => handleTabLayout(index, e)}
                  >
                    <TouchableOpacity
                      onPress={() => handleTabPress(index, route, isFocused)}
                      style={styles.tabButton}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={getIcon(route.name, isActive) as any}
                        size={26}
                        color={isActive ? '#007AFF' : '#8E8E93'}
                      />
                      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                        {getLabel(route.name)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
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
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 36,
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
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  topReflection: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pillAbsolute: {
    position: 'absolute',
    top: (TAB_HEIGHT - PILL_HEIGHT) / 2,
    left: 0,
    zIndex: 1,
    overflow: 'hidden',
    borderRadius: 26,
  },
  pillFallback: {
    backgroundColor: 'rgba(0,122,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.15)',
  },
  pillFallbackGhost: {
    backgroundColor: 'rgba(0,122,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.08)',
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
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
