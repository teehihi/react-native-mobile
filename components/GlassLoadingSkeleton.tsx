import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';

export const GlassLoadingSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Animated.View style={[styles.cardWrapper, { opacity: pulseAnim }]}>
          <LiquidGlassView
            effect="regular"
            tintColor="rgba(229, 231, 235, 0.6)"
            colorScheme="light"
            style={styles.skeletonCard}
          >
            <View style={styles.imageSkeleton} />
            <View style={styles.contentSkeleton}>
              <View style={styles.titleSkeleton} />
              <View style={styles.subtitleSkeleton} />
              <View style={styles.priceSkeleton} />
            </View>
          </LiquidGlassView>
        </Animated.View>

        <Animated.View style={[styles.cardWrapper, { opacity: pulseAnim }]}>
          <LiquidGlassView
            effect="regular"
            tintColor="rgba(229, 231, 235, 0.6)"
            colorScheme="light"
            style={styles.skeletonCard}
          >
            <View style={styles.imageSkeleton} />
            <View style={styles.contentSkeleton}>
              <View style={styles.titleSkeleton} />
              <View style={styles.subtitleSkeleton} />
              <View style={styles.priceSkeleton} />
            </View>
          </LiquidGlassView>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
  },
  skeletonCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  imageSkeleton: {
    width: '100%',
    height: 160,
    backgroundColor: 'rgba(229, 231, 235, 0.3)',
  },
  contentSkeleton: {
    padding: 12,
  },
  titleSkeleton: {
    height: 16,
    backgroundColor: 'rgba(229, 231, 235, 0.5)',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitleSkeleton: {
    height: 12,
    width: '60%',
    backgroundColor: 'rgba(229, 231, 235, 0.5)',
    borderRadius: 4,
    marginBottom: 12,
  },
  priceSkeleton: {
    height: 20,
    width: '40%',
    backgroundColor: 'rgba(229, 231, 235, 0.5)',
    borderRadius: 4,
  },
});
