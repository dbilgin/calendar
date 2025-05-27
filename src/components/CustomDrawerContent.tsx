import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { Calendar } from '../types';
import { CalendarFormModal } from './CalendarFormModal';
import { PlatformButton } from './PlatformButton';

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, actions } = useCalendar();
  const { calendars } = state;
  const { colors } = useTheme();
  
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
          <PlatformButton
            style={styles.calendarNameContainer}
            onPress={() => handleEditCalendar(calendar)}
          >
            <Text style={[styles.calendarName, { color: colors.text }]} numberOfLines={1}>
              {calendar.name}
            </Text>
            {calendar.isDefault && (
              <Text style={[styles.defaultLabel, { color: colors.primary }]}>Default</Text>
            )}
          </PlatformButton>
        </View>
      </View>
    );
  };

  return (
    <>
      <DrawerContentScrollView {...props} style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
        </View>

        {/* Add Calendar Button */}
        <PlatformButton style={[styles.addButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]} onPress={handleAddCalendar}>
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Calendar</Text>
        </PlatformButton>

        {/* Calendar List */}
        <View style={styles.calendarList}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>My Calendars</Text>
          {calendars.map(renderCalendarItem)}
        </View>

        {/* Statistics */}
        <View style={[styles.statsContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{calendars.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {calendars.filter(cal => cal.isVisible).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Visible</Text>
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
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  calendarList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
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
  },
  defaultLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
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