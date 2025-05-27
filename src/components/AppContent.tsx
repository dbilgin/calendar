import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AuthScreen } from './AuthScreen';
import { CustomDrawerContent } from './CustomDrawerContent';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 280,
        },
        headerShown: false, // We'll use our custom header
        drawerType: 'front', // Always use overlay type
        drawerPosition: 'left',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Calendar',
          title: 'Calendar',
        }}
      />
    </Drawer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 