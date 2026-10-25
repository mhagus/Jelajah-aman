import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  try {
    const theme = useAppTheme();
    return theme.resolvedTheme;
  } catch {
    const rn = useRNColorScheme();
    return rn === 'dark' ? 'dark' : 'light';
  }
}
