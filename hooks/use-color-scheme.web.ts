import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  try {
    const theme = useAppTheme();
    if (hasHydrated) {
      return theme.resolvedTheme;
    }
  } catch {
    const rn = useRNColorScheme();
    if (hasHydrated) {
      return rn === 'dark' ? 'dark' : 'light';
    }
  }

  return 'light';
}
