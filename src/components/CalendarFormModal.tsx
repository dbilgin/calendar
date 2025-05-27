import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '../contexts/CalendarContext';
import { Calendar, CalendarFormData } from '../types';
import { CALENDAR_COLORS, getRandomColor } from '../utils/helpers';
import { PlatformButton } from './PlatformButton';

interface CalendarFormModalProps {
  visible: boolean;
  onClose: () => void;
  calendar?: Calendar;
}

export const CalendarFormModal: React.FC<CalendarFormModalProps> = ({
  visible,
  onClose,
  calendar,
}) => {
  const { actions } = useCalendar();

  const [formData, setFormData] = useState<CalendarFormData>({
    name: '',
    color: getRandomColor(),
  });

  useEffect(() => {
    if (visible) {
      if (calendar) {
        // Editing existing calendar
        setFormData({
          id: calendar.id,
          name: calendar.name,
          color: calendar.color,
        });
      } else {
        // Creating new calendar
        setFormData({
          name: '',
          color: getRandomColor(),
        });
      }
    }
  }, [visible, calendar]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a calendar name');
      return;
    }

    try {
      if (formData.id) {
        // Update existing calendar
        await actions.updateCalendar({
          id: formData.id,
          name: formData.name,
          color: formData.color,
          isVisible: calendar!.isVisible,
          isDefault: calendar!.isDefault,
          createdAt: calendar!.createdAt,
          updatedAt: new Date(),
        });
      } else {
        // Create new calendar
        await actions.addCalendar({
          name: formData.name,
          color: formData.color,
        });
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save calendar');
    }
  };

  const handleDelete = async () => {
    if (!calendar) return;

    if (calendar.isDefault) {
      Alert.alert('Error', 'Cannot delete the default calendar');
      return;
    }

    Alert.alert(
      'Delete Calendar',
      'Are you sure you want to delete this calendar? All events in this calendar will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.deleteCalendar(calendar.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete calendar');
            }
          },
        },
      ]
    );
  };

  const renderColorOption = (color: string) => {
    const isSelected = formData.color === color;
    
    return (
      <PlatformButton
        key={color}
        style={[
          styles.colorOption,
          { backgroundColor: color },
          isSelected && styles.colorOptionSelected,
        ]}
        onPress={() => setFormData(prev => ({ ...prev, color }))}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        )}
      </PlatformButton>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <PlatformButton onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </PlatformButton>
          <Text style={styles.title}>
            {calendar ? 'Edit Calendar' : 'New Calendar'}
          </Text>
          <PlatformButton onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </PlatformButton>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Calendar Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Calendar Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter calendar name"
              autoFocus
            />
          </View>

          {/* Color Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {CALENDAR_COLORS.map(renderColorOption)}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Preview</Text>
            <View style={styles.previewContainer}>
              <View style={[styles.previewColor, { backgroundColor: formData.color }]} />
              <Text style={styles.previewText}>
                {formData.name || 'Calendar Name'}
              </Text>
            </View>
          </View>

          {/* Delete Button (for existing calendars) */}
          {calendar && !calendar.isDefault && (
            <PlatformButton style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Calendar</Text>
            </PlatformButton>
          )}

          {calendar?.isDefault && (
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                This is your default calendar and cannot be deleted.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOpacity: 0.3,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  previewColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 20,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    marginVertical: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
}); 