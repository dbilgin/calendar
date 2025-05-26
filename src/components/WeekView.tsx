import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { 
  getWeekDays, 
  getEventsForDate, 
  formatDisplayTime,
  isSameDay 
} from '../utils/dateUtils';
import { Event } from '../types';

interface WeekViewProps {
  onEventPress: (event: Event) => void;
  onTimeSlotPress: (date: Date, hour: number) => void;
  overrideDate?: Date;
}

export const WeekView: React.FC<WeekViewProps> = ({ onEventPress, onTimeSlotPress, overrideDate }) => {
  const { state } = useCalendar();
  const { selectedDate: contextDate, events, calendars, selectedCalendarIds } = state;
  const selectedDate = overrideDate || contextDate;

  // Memoize expensive calculations
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const visibleEvents = useMemo(() => 
    events.filter(event => selectedCalendarIds.includes(event.calendarId)),
    [events, selectedCalendarIds]
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // Memoize calendar color lookup
  const getCalendarColor = useCallback((calendarId: string): string => {
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.color || '#007AFF';
  }, [calendars]);

  // Memoize event position calculation
  const getEventPosition = useCallback((event: Event, date: Date) => {
    if (!isSameDay(event.startDate, date)) return null;

    const startHour = event.startDate.getHours();
    const startMinute = event.startDate.getMinutes();
    const endHour = event.endDate.getHours();
    const endMinute = event.endDate.getMinutes();

    const top = (startHour + startMinute / 60) * 60; // 60px per hour
    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 60;

    return { top, height: Math.max(height, 30) }; // Minimum height of 30px
  }, []);

  // Memoize day events for each date
  const dayEventsMap = useMemo(() => {
    const map = new Map<string, Event[]>();
    weekDays.forEach(date => {
      const dateKey = date.toDateString();
      map.set(dateKey, getEventsForDate(visibleEvents, date));
    });
    return map;
  }, [weekDays, visibleEvents]);

  const renderDayEvents = useCallback((date: Date) => {
    const dateKey = date.toDateString();
    const dayEvents = dayEventsMap.get(dateKey) || [];
    
    return dayEvents.map((event) => {
      const position = getEventPosition(event, date);
      if (!position) return null;

      return (
        <TouchableOpacity
          key={event.id}
          style={[
            styles.eventBlock,
            {
              top: position.top,
              height: position.height,
              backgroundColor: getCalendarColor(event.calendarId),
            }
          ]}
          onPress={() => onEventPress(event)}
        >
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          {!event.isAllDay && (
            <Text style={styles.eventTime}>
              {formatDisplayTime(event.startDate)}
            </Text>
          )}
        </TouchableOpacity>
      );
    });
  }, [dayEventsMap, getEventPosition, getCalendarColor, onEventPress]);

  // Memoize time labels
  const timeLabels = useMemo(() => 
    hours.map(hour => ({
      hour,
      label: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
    })),
    [hours]
  );

  const renderTimeSlot = useCallback((hour: number, date: Date, dayIndex: number) => {
    return (
      <TouchableOpacity
        key={`${dayIndex}-${hour}`} // Use dayIndex instead of date for better performance
        style={styles.timeSlot}
        onPress={() => onTimeSlotPress(date, hour)}
      >
        {/* Empty time slot for event creation */}
      </TouchableOpacity>
    );
  }, [onTimeSlotPress]);



  return (
    <View style={styles.container}>
      <View style={styles.weekContainer}>
        {/* Combined scrollable content */}
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
        >
          {/* Headers row */}
          <View style={styles.headersRow}>
            {/* Time column header */}
            <View style={styles.timeColumnHeader} />
            
            {/* Day headers */}
            {weekDays.map((date, index) => {
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              
              return (
                <View key={index} style={[
                  styles.dayHeader,
                  isToday && styles.dayHeaderToday,
                  isSelected && styles.dayHeaderSelected,
                ]}>
                  <Text style={[
                    styles.dayHeaderText,
                    isToday && styles.dayHeaderTextToday,
                    isSelected && styles.dayHeaderTextSelected,
                  ]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[
                    styles.dayHeaderDate,
                    isToday && styles.dayHeaderDateToday,
                    isSelected && styles.dayHeaderDateSelected,
                  ]}>
                    {date.getDate()}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Time slots and content */}
          <View style={styles.contentContainer}>
            {/* Time labels column */}
            <View style={styles.timeColumn}>
              {timeLabels.map(({ hour, label }) => (
                <View key={hour} style={styles.timeLabel}>
                  <Text style={styles.timeLabelText}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Days content */}
            <View style={styles.daysContent}>
              {weekDays.map((date, index) => (
                <View key={index} style={styles.dayContentColumn}>
                  {hours.map(hour => renderTimeSlot(hour, date, index))}
                  <View style={styles.eventsContainer}>
                    {renderDayEvents(date)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  weekContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  headersRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  timeColumnHeader: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  dayHeader: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  dayHeaderToday: {
    backgroundColor: '#E3F2FD',
  },
  dayHeaderSelected: {
    backgroundColor: '#BBDEFB',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  dayHeaderTextToday: {
    color: '#007AFF',
  },
  dayHeaderTextSelected: {
    color: '#007AFF',
  },
  dayHeaderDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  dayHeaderDateToday: {
    color: '#007AFF',
  },
  dayHeaderDateSelected: {
    color: '#007AFF',
  },
  contentContainer: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 60,
    backgroundColor: '#F8F9FA',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  timeLabel: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  timeLabelText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  daysContent: {
    flex: 1,
    flexDirection: 'row',
  },
  dayContentColumn: {
    flex: 1,
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  timeSlot: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  eventsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eventBlock: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 4,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventTime: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
  },
}); 