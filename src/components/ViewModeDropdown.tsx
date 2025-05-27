import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ViewMode } from '../types';
import { GenericDropdown, DropdownItem } from './GenericDropdown';

interface ViewModeDropdownProps {
  selectedMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  isMobile?: boolean;
}

export const ViewModeDropdown: React.FC<ViewModeDropdownProps> = ({
  selectedMode,
  onModeChange,
  isMobile = false,
}) => {
  const { colors } = useTheme();

  const modes: { value: ViewMode; label: string; icon: string }[] = [
    { value: 'day', label: 'Day', icon: 'calendar-outline' },
    { value: 'week', label: 'Week', icon: 'grid-outline' },
    { value: 'month', label: 'Month', icon: 'apps-outline' },
  ];

  const selectedModeData = modes.find(mode => mode.value === selectedMode);

  const dropdownItems: DropdownItem[] = modes.map((mode) => ({
    key: mode.value,
    content: (
      <View style={styles.dropdownItemContent}>
        <Ionicons 
          name={mode.icon as any} 
          size={16} 
          color={selectedMode === mode.value ? colors.primary : colors.textSecondary} 
        />
        <Text
          style={[
            styles.dropdownItemText,
            { color: selectedMode === mode.value ? colors.primary : colors.text },
          ]}
        >
          {mode.label}
        </Text>
        {selectedMode === mode.value && (
          <Ionicons name="checkmark" size={16} color={colors.primary} />
        )}
      </View>
    ),
    onPress: () => onModeChange(mode.value),
  }));

  const trigger = (
    <View style={styles.trigger}>
      <Ionicons 
        name={selectedModeData?.icon as any} 
        size={16} 
        color={colors.text} 
      />
      <Text style={[styles.triggerText, { color: colors.text }]}>
        {isMobile ? selectedModeData?.label.charAt(0) : selectedModeData?.label}
      </Text>
      <Ionicons 
        name="chevron-down" 
        size={14} 
        color={colors.textSecondary} 
      />
    </View>
  );

  return (
    <GenericDropdown
      trigger={trigger}
      items={dropdownItems}
      isMobile={isMobile}
      dropdownStyle={{ minWidth: 150 }}
    />
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    gap: 6,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
}); 