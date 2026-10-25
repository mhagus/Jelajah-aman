// context/ThemeContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Appearance, ColorSchemeName, useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppThemeColors, Colors, ThemeMode } from '../constants/theme';

const STORAGE_KEY_TEMA = '@jelajah_aman:tema';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  colors: AppThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  resolvedTheme: 'light',
  isDark: false,
  colors: Colors.light,
  setThemeMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    deviceColorScheme === 'dark' ? 'dark' : 'light'
  );

  // Muat tema yang tersimpan dari AsyncStorage saat inisialisasi
  useEffect(() => {
    let aktif = true;
    async function loadTheme() {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY_TEMA);
        if (aktif && savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (e) {
        console.error('Gagal memuat preferensi tema:', e);
      }
    }
    loadTheme();
    return () => {
      aktif = false;
    };
  }, []);

  // Tanggapi perubahan tema sistem
  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
        setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
      }
    );
    return () => subscription.remove();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TEMA, mode);
    } catch (e) {
      console.error('Gagal menyimpan preferensi tema:', e);
    }
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    themeMode === 'system' ? systemScheme : themeMode;

  const isDark = resolvedTheme === 'dark';
  const colors = Colors[resolvedTheme];

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        isDark,
        colors,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme harus digunakan di dalam ThemeProvider');
  }
  return context;
}
