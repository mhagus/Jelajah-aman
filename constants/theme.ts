/**
 * Definisi Tema Warna dan Tipografi untuk Jelajah Aman
 * Mendukung Mode Terang (Light), Gelap (Dark), dan Ikuti Sistem
 */

import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export const Colors = {
  light: {
    // Teks
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',

    // Latar Belakang & Permukaan
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardInner: '#F8FAFC',

    // Aksen & Navigasi
    tint: '#0284C7',
    tintSubtle: '#E0F2FE',
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#0284C7',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    headerBackground: '#FFFFFF',
    headerBorder: '#E2E8F0',

    // Formulir & Input
    inputBackground: '#FFFFFF',
    inputBorder: '#CBD5E1',
    inputText: '#0F172A',
    inputPlaceholder: '#94A3B8',

    // Status & Feedback
    danger: '#DC2626',
    dangerBackground: '#FEF2F2',
    dangerBorder: '#FCA5A5',
    warning: '#D97706',
    warningBackground: '#FFFBEB',
    warningBorder: '#FDE68A',
    success: '#16A34A',
    successBackground: '#F0FDF4',
    successBorder: '#BBF7D0',

    // Komponen Khusus
    badgeBg: '#E2E8F0',
    badgeText: '#334155',
    badgeActiveBg: '#0284C7',
    badgeActiveText: '#FFFFFF',
    divider: '#E2E8F0',
  },
  dark: {
    // Teks
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Latar Belakang & Permukaan
    background: '#0B1120',
    surface: '#1E293B',
    surfaceSubtle: '#0F172A',
    card: '#1E293B',
    cardBorder: '#334155',
    cardInner: '#0F172A',

    // Aksen & Navigasi
    tint: '#38BDF8',
    tintSubtle: '#082F49',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#38BDF8',
    tabBarBackground: '#0F172A',
    tabBarBorder: '#1E293B',
    headerBackground: '#0F172A',
    headerBorder: '#1E293B',

    // Formulir & Input
    inputBackground: '#1E293B',
    inputBorder: '#334155',
    inputText: '#F8FAFC',
    inputPlaceholder: '#64748B',

    // Status & Feedback
    danger: '#EF4444',
    dangerBackground: '#450A0A',
    dangerBorder: '#7F1D1D',
    warning: '#F59E0B',
    warningBackground: '#451A03',
    warningBorder: '#78350F',
    success: '#22C55E',
    successBackground: '#052E16',
    successBorder: '#14532D',

    // Komponen Khusus
    badgeBg: '#334155',
    badgeText: '#E2E8F0',
    badgeActiveBg: '#38BDF8',
    badgeActiveText: '#0B1120',
    divider: '#334155',
  },
};

export type AppThemeColors = typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
