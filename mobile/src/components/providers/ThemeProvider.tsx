import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '@/store';
import { lightTheme, darkTheme, theme } from '@/constants/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useAppSelector((state) => state.ui.theme);
  const systemColorScheme = useColorScheme();

  const getTheme = () => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themePreference === 'dark' ? darkTheme : lightTheme;
  };

  const currentTheme = getTheme();

  // Merge the Paper theme with our custom theme for styled-components
  const styledTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      ...currentTheme.colors,
    },
  };

  return (
    <PaperProvider theme={currentTheme}>
      <StyledThemeProvider theme={styledTheme}>
        {children}
      </StyledThemeProvider>
    </PaperProvider>
  );
};
