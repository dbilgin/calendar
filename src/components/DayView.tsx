import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { 
  getEventsForDate, 
  formatDisplayTime,
  formatDisplayDate 
} from '../utils/dateUtils';
import { Event } from '../types';

interface DayViewProps {
  onEventPress: (event: Event) => void;
  onTimeSlotPress: (date: Date, hour: number) => void;
  overrideDate?: Date;
}

export const DayView: React.FC<DayViewProps> = ({ onEventPress, onTimeSlotPress, overrideDate }) => {
  const { state } = useCalendar();
  const { selectedDate: contextDate, events, calendars, selectedCalendarIds } = state;
  const selectedDate = overrideDate || contextDate;

  const visibleEvents = events.filter(event => 
    selectedCalendarIds.includes(event.calendarId)
  );
  const dayEvents = getEventsForDate(visibleEvents, selectedDate);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getCalendarColor = (calendarId: string): string => {
    const calendar = calendars.find(cal => cal.id === calendarId);
    return calendar?.color || '#007AFF';
  };

  const getEventPosition = (event: Event) => {
    const startHour = event.startDate.getHours();
    const startMinute = event.startDate.getMinutes();
    const endHour = event.endDate.getHours();
    const endMinute = event.endDate.getMinutes();

    const top = (startHour + startMinute / 60) * 80; // 80px per hour
    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 80;

    return { top, height: Math.max(height, 40) }; // Minimum height of 40px
  };

  const renderEvent = (event: Event) => {
    if (event.isAllDay) {
      return (
        <TouchableOpacity
          key={event.id}
          style={[
            styles.allDayEvent,
            { backgroundColor: getCalendarColor(event.calendarId) }
          ]}
          onPress={() => onEventPress(event)}
        >
          <Text style={styles.allDayEventText} numberOfLines={1}>
            {event.title}
          </Text>
        </TouchableOpacity>
      );
    }

    const position = getEventPosition(event);
    return (
      <TouchableOpacity
        key={event.id}
        style={[
          styles.timedEvent,
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
        <Text style={styles.eventTime}>
          {formatDisplayTime(event.startDate)} - {formatDisplayTime(event.endDate)}
        </Text>
        {event.location && (
          <Text style={styles.eventLocation} numberOfLines={1}>
            📍 {event.location}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = (hour: number) => {
    const timeString = hour === 0 ? '12 AM' : 
                     hour < 12 ? `${hour} AM` : 
                     hour === 12 ? '12 PM' : 
                     `${hour - 12} PM`;

    return (
      <TouchableOpacity
        key={hour}
        style={styles.timeSlot}
        onPress={() => onTimeSlotPress(selectedDate, hour)}
      >
        <View style={styles.timeSlotHeader}>
          <Text style={styles.timeSlotText}>{timeString}</Text>
        </View>
        <View style={styles.timeSlotContent} />
      </TouchableOpacity>
    );
  };

  const allDayEvents = dayEvents.filter(event => event.isAllDay);
  const timedEvents = dayEvents.filter(event => !event.isAllDay);

  return (
    <View style={styles.container}>
      {/* Day header */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderText}>
          {formatDisplayDate(selectedDate)}
        </Text>
        {allDayEvents.length > 0 && (
          <View style={styles.allDaySection}>
            <Text style={styles.allDaySectionTitle}>All Day</Text>
            <View style={styles.allDayEvents}>
              {allDayEvents.map(renderEvent)}
            </View>
          </View>
        )}
      </View>

      {/* Time slots and events */}
      <ScrollView 
        style={styles.timeContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeSlots}>
          {hours.map(renderTimeSlot)}
          
          {/* Timed events overlay */}
          <View style={styles.eventsOverlay}>
            {timedEvents.map(renderEvent)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dayHeader: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  allDaySection: {
    marginTop: 8,
  },
  allDaySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  allDayEvents: {
    gap: 4,
  },
  allDayEvent: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  allDayEventText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeContainer: {
    flex: 1,
  },
  timeSlots: {
    position: 'relative',
    paddingHorizontal: 16,
  },
  timeSlot: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
  },
  timeSlotHeader: {
    width: 80,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingTop: 4,
  },
  timeSlotText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  timeSlotContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5E5',
  },
  eventsOverlay: {
    position: 'absolute',
    top: 0,
    left: 96, // 80px for time + 16px padding
    right: 16,
    bottom: 0,
  },
  timedEvent: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 6,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
  },
}); 