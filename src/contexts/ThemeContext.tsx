import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  shadow: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
}

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  primary: '#007AFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  card: '#FFFFFF',
  shadow: '#000000',
  accent: '#FF6B35',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
};

const darkTheme: ThemeColors = {
  background: '#1A1A1A',
  surface: '#2C2C2E',
  primary: '#0A84FF',
  text: '#F2F2F7',
  textSecondary: '#8E8E93',
  border: '#48484A',
  card: '#2C2C2E',
  shadow: '#000000',
  accent: '#FF6B35',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');

  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 