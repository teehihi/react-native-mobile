import React, { memo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LiquidGlassView } from '@callstack/liquid-glass';

export interface FilterOption {
  key: string;
  label: string;
  icon?: string;
}

interface FilterGlassBarProps {
  options: FilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  title?: string;
}



const FilterPill = memo(({ option, isSelected, onPress }: { option: FilterOption, isSelected: boolean, onPress: () => void }) => {
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
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pillContainer}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LiquidGlassView 
        effect="regular"
        colorScheme="light"
        tintColor={isSelected ? "rgba(22, 163, 74, 0.9)" : "rgba(255,255,255,0.8)"}
        style={[
          styles.glassPill, 
          isSelected ? styles.glassPillSelected : styles.glassPillUnselected
        ]}
      >
        <View style={styles.pillContent}>
          {option.icon && (
            <MaterialCommunityIcons 
              name={option.icon as any} 
              size={16} 
              color={isSelected ? '#fff' : '#6B7280'} 
              style={styles.icon}
            />
          )}
          <Text style={[
            styles.pillText,
            isSelected ? styles.pillTextSelected : styles.pillTextUnselected
          ]}>
            {option.label}
          </Text>
        </View>
        </LiquidGlassView>
      </Animated.View>
    </TouchableOpacity>
  );
});

const FilterGlassBar: React.FC<FilterGlassBarProps> = ({ options, selectedKey, onSelect, title }) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <FilterPill 
            key={option.key} 
            option={option} 
            isSelected={selectedKey === option.key}
            onPress={() => onSelect(option.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  pillContainer: {
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 20,
  },
  glassPill: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  glassPillSelected: {
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(22, 163, 74, 0.8)', // Green tint
  },
  glassPillUnselected: {
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#fff',
  },
  pillTextUnselected: {
    color: '#4B5563',
  },
});

export const FilterGlassBarComponent = memo(FilterGlassBar);
