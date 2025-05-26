import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '../contexts/CalendarContext';
import { Event, EventFormData } from '../types';
import { formatDate, formatTime, createDateFromTimeString } from '../utils/dateUtils';

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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {event ? 'Edit Event' : 'New Event'}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Event title"
              autoFocus
            />
          </View>

          {/* Calendar Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Calendar</Text>
            <View style={styles.calendarSelector}>
              {calendars.map((calendar) => (
                <TouchableOpacity
                  key={calendar.id}
                  style={[
                    styles.calendarOption,
                    formData.calendarId === calendar.id && styles.calendarOptionSelected,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, calendarId: calendar.id }))}
                >
                  <View style={[styles.calendarColor, { backgroundColor: calendar.color }]} />
                  <Text style={styles.calendarName}>{calendar.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* All Day Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>All Day</Text>
              <Switch
                value={formData.isAllDay}
                onValueChange={handleAllDayToggle}
                trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Start Date/Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Starts</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={startDateString}
                onChangeText={setStartDateString}
                placeholder="YYYY-MM-DD"
              />
              {!formData.isAllDay && (
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  value={startTimeString}
                  onChangeText={setStartTimeString}
                  placeholder="HH:MM"
                />
              )}
            </View>
          </View>

          {/* End Date/Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ends</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={endDateString}
                onChangeText={setEndDateString}
                placeholder="YYYY-MM-DD"
              />
              {!formData.isAllDay && (
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  value={endTimeString}
                  onChangeText={setEndTimeString}
                  placeholder="HH:MM"
                />
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Add location"
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Add description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Delete Button (for existing events) */}
          {event && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </TouchableOpacity>
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
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
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
    borderColor: '#E5E5E5',
  },
  calendarOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  calendarColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  calendarName: {
    fontSize: 16,
    color: '#1A1A1A',
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