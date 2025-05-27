import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GenericDropdown, DropdownItem } from './GenericDropdown';

interface UserDropdownProps {
  isMobile?: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ isMobile = false }) => {
  const { user, signOut } = useAuth();
  const { colors, theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'phone-portrait';
      default:
        return 'sunny';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System';
      default:
        return 'Light Mode';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const dropdownItems: DropdownItem[] = [
    {
      key: 'user-info',
      content: (
        <View style={styles.userInfo}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.userInitials}>{getUserInitials()}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {getUserDisplayName()}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>
      ),
      onPress: () => {}, // No action for user info
    },
    {
      key: 'separator',
      content: <View style={[styles.separator, { backgroundColor: colors.border }]} />,
      onPress: () => {}, // No action for separator
    },
    {
      key: 'theme-toggle',
      content: (
        <View style={styles.dropdownItemContent}>
          <Ionicons name={getThemeIcon()} size={20} color={colors.text} />
          <Text style={[styles.dropdownItemText, { color: colors.text }]}>
            {getThemeLabel()}
          </Text>
        </View>
      ),
      onPress: handleThemeToggle,
    },
    {
      key: 'sign-out',
      content: (
        <View style={styles.dropdownItemContent}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.dropdownItemText, { color: colors.error }]}>
            Sign Out
          </Text>
        </View>
      ),
      onPress: handleSignOut,
    },
  ];

  const trigger = (
    <View style={styles.userButton}>
      <View style={[styles.userAvatarSmall, { backgroundColor: colors.primary }]}>
        <Text style={[styles.userInitials, styles.userInitialsSmall]}>{getUserInitials()}</Text>
      </View>
      {!isMobile && <Ionicons name="chevron-down" size={16} color={colors.text} />}
    </View>
  );

  return (
    <GenericDropdown
      trigger={trigger}
      items={dropdownItems}
      isMobile={isMobile}
      dropdownStyle={{ minWidth: 220 }}
    />
  );
};

const styles = StyleSheet.create({
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  userAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userInitialsSmall: {
    fontSize: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginHorizontal: 0,
    marginVertical: 4,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 