import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ViewMode } from '../types';
import { PlatformButton } from './PlatformButton';

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
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const modes: { value: ViewMode; label: string; icon: string }[] = [
    { value: 'day', label: 'Day', icon: 'calendar-outline' },
    { value: 'week', label: 'Week', icon: 'grid-outline' },
    { value: 'month', label: 'Month', icon: 'apps-outline' },
  ];

  const selectedModeData = modes.find(mode => mode.value === selectedMode);

  const toggleDropdown = () => {
    if (isOpen) {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleModeSelect = (mode: ViewMode) => {
    onModeChange(mode);
    toggleDropdown();
  };

  const renderDropdownContent = () => (
    <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {modes.map((mode) => (
        <PlatformButton
          key={mode.value}
          style={[
            styles.dropdownItem,
            selectedMode === mode.value && { backgroundColor: colors.primary + '15' },
          ]}
          onPress={() => handleModeSelect(mode.value)}
        >
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
        </PlatformButton>
      ))}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <PlatformButton
          style={[styles.trigger, { borderColor: colors.border }]}
          onPress={toggleDropdown}
        >
          <Ionicons 
            name={selectedModeData?.icon as any} 
            size={16} 
            color={colors.text} 
          />
          <Text style={[styles.triggerText, { color: colors.text }]}>
            {isMobile ? selectedModeData?.label.charAt(0) : selectedModeData?.label}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={14} 
            color={colors.textSecondary} 
          />
        </PlatformButton>
        
        {isOpen && (
          <Animated.View
            style={[
              styles.dropdownContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            {renderDropdownContent()}
          </Animated.View>
        )}
        
        {isOpen && (
          <PlatformButton
            style={styles.overlay}
            onPress={toggleDropdown}
          >
            <View />
          </PlatformButton>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlatformButton
        style={[styles.trigger, { borderColor: colors.border }]}
        onPress={toggleDropdown}
      >
        <Ionicons 
          name={selectedModeData?.icon as any} 
          size={16} 
          color={colors.text} 
        />
        <Text style={[styles.triggerText, { color: colors.text }]}>
          {isMobile ? selectedModeData?.label.charAt(0) : selectedModeData?.label}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={14} 
          color={colors.textSecondary} 
        />
      </PlatformButton>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleDropdown}
      >
        <PlatformButton
          style={styles.modalOverlay}
          onPress={toggleDropdown}
        >
          <Animated.View
            style={[
              styles.modalDropdown,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            {renderDropdownContent()}
          </Animated.View>
        </PlatformButton>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    gap: 6,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1001,
    marginTop: 4,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDropdown: {
    minWidth: 150,
    maxWidth: 200,
  },
}); 