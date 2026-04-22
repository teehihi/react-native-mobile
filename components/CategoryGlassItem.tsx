import React from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';

interface CategoryGlassItemProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const CategoryGlassItem: React.FC<CategoryGlassItemProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [isSelected]);

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
          effect={isSelected ? 'regular' : 'clear'}
          tintColor={isSelected ? '#00B14F' : 'rgba(255, 255, 255, 0.3)'}
          colorScheme="light"
          interactive={true}
          style={[
            styles.glassContainer,
            isSelected && styles.selectedGlass,
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
    marginRight: 12,
  },
  glassContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedGlass: {
    borderColor: 'rgba(0, 177, 79, 0.5)',
    shadowColor: '#00B14F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#ffffff',
  },
  unselectedLabel: {
    color: '#374151',
  },
});
