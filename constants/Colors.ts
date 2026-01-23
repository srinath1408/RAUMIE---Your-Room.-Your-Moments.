/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other colors defined in the theme which can be used throughout the app.
 */

const tintColorLight = '#4F46E5'; // Indigo 600
const tintColorDark = '#818CF8'; // Indigo 400

export const Colors = {
  light: {
    text: '#111827', // Gray 900
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280', // Gray 500
    tabIconDefault: '#9CA3AF', // Gray 400
    tabIconSelected: tintColorLight,
    border: '#E5E7EB', // Gray 200
  },
  dark: {
    text: '#F9FAFB', // Gray 50
    background: '#0F172A', // Slate 900 (Rich dark background)
    tint: tintColorDark,
    icon: '#9CA3AF', // Gray 400
    tabIconDefault: '#9CA3AF', // Gray 400
    tabIconSelected: tintColorDark,
    border: '#1F2937', // Gray 800
  },
};
