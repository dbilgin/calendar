import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '../contexts/CalendarContext';
import { Calendar } from '../types';
import { CalendarFormModal } from './CalendarFormModal';

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, actions } = useCalendar();
  const { calendars } = state;
  
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | undefined>();

  const handleToggleVisibility = async (calendarId: string) => {
    try {
      await actions.toggleCalendarVisibility(calendarId);
    } catch (error) {
      console.error('Failed to toggle calendar visibility:', error);
    }
  };

  const handleAddCalendar = () => {
    setSelectedCalendar(undefined);
    setCalendarModalVisible(true);
  };

  const handleEditCalendar = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setCalendarModalVisible(true);
  };

  const closeCalendarModal = () => {
    setCalendarModalVisible(false);
    setSelectedCalendar(undefined);
  };

  const renderCalendarItem = (calendar: Calendar) => {
    return (
      <View key={calendar.id} style={styles.calendarItem}>
        <View style={styles.calendarInfo}>
          <Switch
            value={calendar.isVisible}
            onValueChange={() => handleToggleVisibility(calendar.id)}
            trackColor={{ false: '#E5E5E5', true: calendar.color }}
            thumbColor="#FFFFFF"
            style={styles.calendarSwitch}
          />
          <View style={[styles.calendarColor, { backgroundColor: calendar.color }]} />
          <TouchableOpacity
            style={styles.calendarNameContainer}
            onPress={() => handleEditCalendar(calendar)}
          >
            <Text style={styles.calendarName} numberOfLines={1}>
              {calendar.name}
            </Text>
            {calendar.isDefault && (
              <Text style={styles.defaultLabel}>Default</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <DrawerContentScrollView {...props} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
        </View>

        {/* Add Calendar Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddCalendar}>
          <Ionicons name="add" size={20} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Calendar</Text>
        </TouchableOpacity>

        {/* Calendar List */}
        <View style={styles.calendarList}>
          <Text style={styles.sectionTitle}>My Calendars</Text>
          {calendars.map(renderCalendarItem)}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{calendars.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {calendars.filter(cal => cal.isVisible).length}
            </Text>
            <Text style={styles.statLabel}>Visible</Text>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Calendar Form Modal */}
      <CalendarFormModal
        visible={calendarModalVisible}
        onClose={closeCalendarModal}
        calendar={selectedCalendar}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  calendarList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarItem: {
    marginBottom: 4,
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  calendarSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginRight: 8,
  },
  calendarColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  calendarNameContainer: {
    flex: 1,
  },
  calendarName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  defaultLabel: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
    marginTop: 'auto',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
}); 