import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getCalendarGrid, 
  getEventsForDate, 
  formatDate, 
  formatDisplayTime,
  isSameMonth,
  isSameDay 
} from '../utils/dateUtils';
import { Event } from '../types';
import { PlatformButton } from './PlatformButton';

interface MonthViewProps {
  onEventPress: (event: Event) => void;
  onDatePress: (date: Date) => void;
  onDateNumberPress?: (date: Date) => void;
  overrideDate?: Date;
}



export const MonthView: React.FC<MonthViewProps> = ({ onEventPress, onDatePress, onDateNumberPress, overrideDate }) => {
  const { state } = useCalendar();
  const { selectedDate: contextDate, events, calendars, selectedCalendarIds } = state;
  const selectedDate = overrideDate || contextDate;
  const { colors } = useTheme();
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
          <PlatformButton
            key={event.id}
            style={[
              styles.eventDot,
              { backgroundColor: getCalendarColor(event.calendarId) }
            ]}
            onPress={() => onEventPress(event)}
          >
            <Text style={styles.eventText} numberOfLines={1}>
              {!event.isAllDay && `${formatDisplayTime(event.startDate)} `}
              {event.title}
            </Text>
          </PlatformButton>
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
      <PlatformButton
        key={index}
        style={[
          styles.dayContainer,
          { backgroundColor: colors.background, borderColor: colors.border },
          !isCurrentMonth && { backgroundColor: colors.surface },
          isToday && { backgroundColor: colors.primary + '20' },
        ]}
        onPress={() => onDatePress(date)}
      >
        <PlatformButton
          style={styles.dateNumberContainer}
          onPress={() => onDateNumberPress?.(date)}
        >
          <Text
            style={[
              styles.dayText,
              { color: colors.text },
              !isCurrentMonth && { color: colors.textSecondary },
              isToday && { color: colors.primary, fontWeight: 'bold' },
            ]}
          >
            {date.getDate()}
          </Text>
        </PlatformButton>
        {dayEvents.length > 0 && (
          <View style={styles.eventIndicator}>
            <Text style={styles.eventCount}>{dayEvents.length}</Text>
          </View>
        )}
        {renderDayEvents(date)}
      </PlatformButton>
    );
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Week day headers */}
      <View style={[styles.weekHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {weekDays.map((day) => (
          <View key={day} style={styles.weekDayContainer}>
            <Text style={[styles.weekDayText, { color: colors.textSecondary }]}>{day}</Text>
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
    minHeight: '100%', // Ensure full height on web
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
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
    padding: 4,
  },
  dateNumberContainer: {
    width: '100%',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
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