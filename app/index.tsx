import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarHeader } from '../src/components/CalendarHeader';
import { SwipeableCalendar } from '../src/components/SwipeableCalendar';
import { MonthView } from '../src/components/MonthView';
import { WeekView } from '../src/components/WeekView';
import { DayView } from '../src/components/DayView';
import { EventFormModal } from '../src/components/EventFormModal';
import { CalendarFormModal } from '../src/components/CalendarFormModal';
import { useCalendar } from '../src/contexts/CalendarContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Event, Calendar } from '../src/types';

export default function CalendarScreen() {
  const { state, actions } = useCalendar();
  const { viewMode } = state;
  const { colors } = useTheme();

  // Modal states
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  // Form states
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | undefined>();
  const [initialEventDate, setInitialEventDate] = useState<Date | undefined>();
  const [initialEventHour, setInitialEventHour] = useState<number | undefined>();

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setInitialEventDate(undefined);
    setInitialEventHour(undefined);
    setEventModalVisible(true);
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setInitialEventDate(undefined);
    setInitialEventHour(undefined);
    setEventModalVisible(true);
  };

  const handleDatePress = (date: Date) => {
    setInitialEventDate(date);
    setInitialEventHour(undefined);
    setSelectedEvent(undefined);
    setEventModalVisible(true);
  };

  const handleTimeSlotPress = (date: Date, hour: number) => {
    setInitialEventDate(date);
    setInitialEventHour(hour);
    setSelectedEvent(undefined);
    setEventModalVisible(true);
  };

  const handleDateNumberPress = (date: Date) => {
    actions.setSelectedDate(date);
    actions.setViewMode('day');
  };

  const handleAddCalendar = () => {
    setSelectedCalendar(undefined);
    setCalendarModalVisible(true);
  };

  const handleEditCalendar = (calendar: Calendar) => {
    setSelectedCalendar(calendar);
    setCalendarModalVisible(true);
  };

  const closeEventModal = () => {
    setEventModalVisible(false);
    setSelectedEvent(undefined);
    setInitialEventDate(undefined);
    setInitialEventHour(undefined);
  };

  const closeCalendarModal = () => {
    setCalendarModalVisible(false);
    setSelectedCalendar(undefined);
  };

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'month':
        return (
          <MonthView
            onEventPress={handleEventPress}
            onDatePress={handleDatePress}
            onDateNumberPress={handleDateNumberPress}
          />
        );
      case 'week':
        return (
          <WeekView
            onEventPress={handleEventPress}
            onTimeSlotPress={handleTimeSlotPress}
          />
        );
      case 'day':
        return (
          <DayView
            onEventPress={handleEventPress}
            onTimeSlotPress={handleTimeSlotPress}
          />
        );
      default:
        return (
          <MonthView
            onEventPress={handleEventPress}
            onDatePress={handleDatePress}
            onDateNumberPress={handleDateNumberPress}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CalendarHeader
        onAddEvent={handleAddEvent}
      />
      
      <View style={styles.contentContainer}>
        <SwipeableCalendar 
          onEventPress={handleEventPress}
          onDatePress={handleDatePress}
          onTimeSlotPress={handleTimeSlotPress}
        >
          <View style={styles.calendarContainer}>
            {renderCalendarView()}
          </View>
        </SwipeableCalendar>
      </View>

      {/* Event Form Modal */}
      <EventFormModal
        visible={eventModalVisible}
        onClose={closeEventModal}
        event={selectedEvent}
        initialDate={initialEventDate}
        initialHour={initialEventHour}
      />

      {/* Calendar Form Modal */}
      <CalendarFormModal
        visible={calendarModalVisible}
        onClose={closeCalendarModal}
        calendar={selectedCalendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1,
  },
}); 