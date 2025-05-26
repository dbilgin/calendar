import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { 
  getCalendarGrid, 
  getEventsForDate, 
  formatDate, 
  isSameMonth,
  isSameDay 
} from '../utils/dateUtils';
import { Event } from '../types';

interface MonthViewProps {
  onEventPress: (event: Event) => void;
  onDatePress: (date: Date) => void;
  overrideDate?: Date;
}



export const MonthView: React.FC<MonthViewProps> = ({ onEventPress, onDatePress, overrideDate }) => {
  const { state } = useCalendar();
  const { selectedDate: contextDate, events, calendars, selectedCalendarIds } = state;
  const selectedDate = overrideDate || contextDate;
  const { height } = useWindowDimensions();

  const calendarDays = getCalendarGrid(selectedDate);
  const visibleEvents = events.filter(event => 
    selectedCalendarIds.includes(event.calendarId)
  );

  const getCalendarColor = (calendarId: string): string => {
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.color || '#007AFF';
  };

  const renderDayEvents = (date: Date) => {
    const dayEvents = getEventsForDate(visibleEvents, date);
    const maxEventsToShow = 2; // Reduced to fit better in the cell
    const eventsToShow = dayEvents.slice(0, maxEventsToShow);
    const remainingCount = dayEvents.length - maxEventsToShow;

    return (
      <View style={styles.eventsContainer}>
        {eventsToShow.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            style={[
              styles.eventDot,
              { backgroundColor: getCalendarColor(event.calendarId) }
            ]}
            onPress={() => onEventPress(event)}
          >
            <Text style={styles.eventText} numberOfLines={1}>
              {event.title}
            </Text>
          </TouchableOpacity>
        ))}
        {remainingCount > 0 && (
          <Text style={styles.moreEventsText}>
            +{remainingCount} more
          </Text>
        )}
      </View>
    );
  };

  const renderDay = (date: Date, index: number) => {
    const isCurrentMonth = isSameMonth(date, selectedDate);
    const isToday = isSameDay(date, new Date());
    const dayEvents = getEventsForDate(visibleEvents, date);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayContainer,
          !isCurrentMonth && styles.dayContainerOtherMonth,
          isToday && styles.dayContainerToday,
        ]}
        onPress={() => onDatePress(date)}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.dayTextOtherMonth,
            isToday && styles.dayTextToday,
          ]}
        >
          {date.getDate()}
        </Text>
        {dayEvents.length > 0 && (
          <View style={styles.eventIndicator}>
            <Text style={styles.eventCount}>{dayEvents.length}</Text>
          </View>
        )}
        {renderDayEvents(date)}
      </TouchableOpacity>
    );
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.container}>
      {/* Week day headers */}
      <View style={styles.weekHeader}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayContainer}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={[styles.calendarGrid, { minHeight: height - 200 }]}>
        {calendarDays.map((date, index) => renderDay(date, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minHeight: '100%', // Ensure full height on web
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  calendarGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%', // 100% / 7 days
    height: '16.66%', // 100% / 6 rows
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    padding: 4,
    backgroundColor: '#FFFFFF',
  },
  dayContainerOtherMonth: {
    backgroundColor: '#F8F9FA',
  },
  dayContainerToday: {
    backgroundColor: '#E3F2FD',
  },
  dayContainerSelected: {
    backgroundColor: '#BBDEFB',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  dayTextOtherMonth: {
    color: '#CCCCCC',
  },
  dayTextToday: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dayTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  eventIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventsContainer: {
    flex: 1,
    marginTop: 4,
  },
  eventDot: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 2,
  },
  eventText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  moreEventsText: {
    fontSize: 10,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 