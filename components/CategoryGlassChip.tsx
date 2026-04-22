import React from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet, Platform } from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';

interface CategoryGlassChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const CategoryGlassChip: React.FC<CategoryGlassChipProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LiquidGlassView
          effect="regular"
          tintColor={isSelected ? 'rgba(0, 190, 0, 0.18)' : 'rgba(255, 255, 255, 0.5)'}
          colorScheme="light"
          interactive={false}
          style={[
            styles.glassChip,
            isSelected && styles.selectedChip,
          ]}
        >
          <Text
            style={[
              styles.label,
              isSelected ? styles.selectedLabel : styles.unselectedLabel,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </LiquidGlassView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  glassChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    // Strong white border for glass edge effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    // Stronger shadow for floating effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedChip: {
    borderColor: 'rgba(0, 190, 0, 0.6)',
    backgroundColor: 'rgba(0, 190, 0, 0.12)',
    // Stronger shadow when selected
    ...Platform.select({
      ios: {
        shadowColor: '#00B14F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  selectedLabel: {
    color: '#00A040', // Darker green for better contrast
    fontWeight: '700',
  },
  unselectedLabel: {
    color: '#6B7280',
  },
});
