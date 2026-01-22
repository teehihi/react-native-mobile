export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',
  
  white: '#ffffff',
  black: '#000000',
  gray: '#7f8c8d',
  darkGray: '#95a5a6',
  lightGray: '#f8f9fa',
  
  text: '#2c3e50',
  textSecondary: '#34495e',
  textLight: '#7f8c8d',
  background: '#f5f7fa',
} as const;

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 16,
  margin: 16,
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body1: 16,
  body2: 14,
  body3: 12,
  caption: 10,
} as const;

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold' as const },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold' as const },
  h3: { fontSize: SIZES.h3, fontWeight: '600' as const },
  h4: { fontSize: SIZES.h4, fontWeight: '600' as const },
  body1: { fontSize: SIZES.body1, fontWeight: 'normal' as const },
  body2: { fontSize: SIZES.body2, fontWeight: 'normal' as const },
  body3: { fontSize: SIZES.body3, fontWeight: 'normal' as const },
  caption: { fontSize: SIZES.caption, fontWeight: 'normal' as const },
} as const;

// Export theme object with colors property for compatibility
export const theme = {
  colors: COLORS,
  sizes: SIZES,
  fonts: FONTS,
};