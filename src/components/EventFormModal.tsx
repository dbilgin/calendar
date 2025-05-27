import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { Event, EventFormData } from '../types';
import { formatDate, formatTime, createDateFromTimeString } from '../utils/dateUtils';
import { PlatformButton } from './PlatformButton';

interface EventFormModalProps {
  visible: boolean;
  onClose: () => void;
  event?: Event;
  initialDate?: Date;
  initialHour?: number;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  visible,
  onClose,
  event,
  initialDate,
  initialHour,
}) => {
  const { state, actions } = useCalendar();
  const { calendars } = state;
  const { colors } = useTheme();

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    isAllDay: false,
    calendarId: '',
    location: '',
    reminder: undefined,
  });

  const [startDateString, setStartDateString] = useState('');
  const [startTimeString, setStartTimeString] = useState('');
  const [endDateString, setEndDateString] = useState('');
  const [endTimeString, setEndTimeString] = useState('');

  useEffect(() => {
    if (visible) {
      if (event) {
        // Editing existing event
        setFormData({
          id: event.id,
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          isAllDay: event.isAllDay,
          calendarId: event.calendarId,
          location: event.location || '',
          reminder: event.reminder,
        });
        updateDateTimeStrings(event.startDate, event.endDate);
      } else {
        // Creating new event
        const defaultCalendar = calendars.find(cal => cal.isDefault) || calendars[0];
        const startDate = initialDate || new Date();
        
        if (initialHour !== undefined) {
          startDate.setHours(initialHour, 0, 0, 0);
        }
        
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        setFormData({
          title: '',
          description: '',
          startDate,
          endDate,
          isAllDay: false,
          calendarId: defaultCalendar?.id || '',
          location: '',
          reminder: undefined,
        });
        updateDateTimeStrings(startDate, endDate);
      }
    }
  }, [visible, event, initialDate, initialHour, calendars]);

  const updateDateTimeStrings = (start: Date, end: Date) => {
    setStartDateString(formatDate(start));
    setStartTimeString(formatTime(start));
    setEndDateString(formatDate(end));
    setEndTimeString(formatTime(end));
  };

  const handleDateTimeChange = () => {
    try {
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);

      if (!formData.isAllDay) {
        const startWithTime = createDateFromTimeString(startDate, startTimeString);
        const endWithTime = createDateFromTimeString(endDate, endTimeString);
        
        setFormData(prev => ({
          ...prev,
          startDate: startWithTime,
          endDate: endWithTime,
        }));
      } else {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        setFormData(prev => ({
          ...prev,
          startDate,
          endDate,
        }));
      }
    } catch (error) {
      console.error('Invalid date/time format');
    }
  };

  useEffect(() => {
    handleDateTimeChange();
  }, [startDateString, startTimeString, endDateString, endTimeString, formData.isAllDay]);

  const handleAllDayToggle = (value: boolean) => {
    setFormData(prev => ({ ...prev, isAllDay: value }));
    
    if (value) {
      const start = new Date(startDateString);
      const end = new Date(endDateString);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      setFormData(prev => ({
        ...prev,
        startDate: start,
        endDate: end,
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!formData.calendarId) {
      Alert.alert('Error', 'Please select a calendar');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    try {
      if (formData.id) {
        // Update existing event
        await actions.updateEvent({
          id: formData.id,
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isAllDay: formData.isAllDay,
          calendarId: formData.calendarId,
          location: formData.location,
          reminder: formData.reminder,
          createdAt: event!.createdAt,
          updatedAt: new Date(),
        });
      } else {
        // Create new event
        await actions.addEvent({
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isAllDay: formData.isAllDay,
          calendarId: formData.calendarId,
          location: formData.location,
          reminder: formData.reminder,
        });
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.deleteEvent(event.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <PlatformButton onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
          </PlatformButton>
          <Text style={[styles.title, { color: colors.text }]}>
            {event ? 'Edit Event' : 'New Event'}
          </Text>
          <PlatformButton onPress={handleSave}>
            <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
          </PlatformButton>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Event title"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
          </View>

          {/* Calendar Selection */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Calendar</Text>
            <View style={styles.calendarSelector}>
              {calendars.map((calendar) => (
                <PlatformButton
                  key={calendar.id}
                  style={[
                    styles.calendarOption,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    formData.calendarId === calendar.id && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, calendarId: calendar.id }))}
                >
                  <View style={[styles.calendarColor, { backgroundColor: calendar.color }]} />
                  <Text style={[styles.calendarName, { color: colors.text }]}>{calendar.name}</Text>
                </PlatformButton>
              ))}
            </View>
          </View>

          {/* All Day Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: colors.text }]}>All Day</Text>
              <Switch
                value={formData.isAllDay}
                onValueChange={handleAllDayToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Start Date/Time */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Starts</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                style={[styles.input, styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={startDateString}
                onChangeText={setStartDateString}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
              {!formData.isAllDay && (
                <TextInput
                  style={[styles.input, styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={startTimeString}
                  onChangeText={setStartTimeString}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                />
              )}
            </View>
          </View>

          {/* End Date/Time */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Ends</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                style={[styles.input, styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={endDateString}
                onChangeText={setEndDateString}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
              {!formData.isAllDay && (
                <TextInput
                  style={[styles.input, styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={endTimeString}
                  onChangeText={setEndTimeString}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                />
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Add location"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Add description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Delete Button (for existing events) */}
          {event && (
            <PlatformButton style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </PlatformButton>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  calendarSelector: {
    gap: 8,
  },
  calendarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  calendarColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  calendarName: {
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
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
}); 