import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { CalendarProvider } from '../src/contexts/CalendarContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { AppContent } from '../src/components/AppContent';

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CalendarProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppContent />
          </GestureHandlerRootView>
        </CalendarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 