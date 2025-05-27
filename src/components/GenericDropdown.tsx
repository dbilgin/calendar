import React, { useState, ReactNode } from 'react';
import { View, StyleSheet, Modal, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PlatformButton } from './PlatformButton';

export interface DropdownItem {
  key: string;
  content: ReactNode;
  onPress: () => void;
}

interface GenericDropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  isMobile?: boolean;
  dropdownStyle?: any;
  containerStyle?: any;
}

export const GenericDropdown: React.FC<GenericDropdownProps> = ({
  trigger,
  items,
  isMobile = false,
  dropdownStyle,
  containerStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  const handleItemPress = (item: DropdownItem) => {
    setIsOpen(false);
    item.onPress();
  };

  const renderDropdownContent = () => (
    <View style={[
      styles.dropdown, 
      { backgroundColor: colors.surface, borderColor: colors.border },
      dropdownStyle
    ]}>
      {items.map((item, index) => (
        <PlatformButton
          key={item.key}
          style={[
            styles.dropdownItem,
            index === items.length - 1 && styles.lastItem,
          ]}
          onPress={() => handleItemPress(item)}
        >
          {item.content}
        </PlatformButton>
      ))}
    </View>
  );

  if (isMobile) {
    return (
      <>
        <PlatformButton onPress={() => setIsOpen(true)}>
          {trigger}
        </PlatformButton>

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <PlatformButton 
            style={styles.modalOverlay} 
            onPress={() => setIsOpen(false)}
          >
            <View style={styles.modalContent}>
              {renderDropdownContent()}
            </View>
          </PlatformButton>
        </Modal>
      </>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <PlatformButton onPress={() => setIsOpen(!isOpen)}>
        {trigger}
      </PlatformButton>

      {isOpen && (
        <>
          <PlatformButton 
            style={styles.overlay} 
            onPress={() => setIsOpen(false)} 
          >
            <View />
          </PlatformButton>
          {renderDropdownContent()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10000,
  },
  overlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    minWidth: 180,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10001,
    marginTop: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lastItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
  },
}); 