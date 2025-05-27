import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useCalendar } from "../contexts/CalendarContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  getWeekDays,
  getEventsForDate,
  formatDisplayTime,
  isSameDay,
} from "../utils/dateUtils";
import { Event } from "../types";
import { HEADER_HEIGHT } from "../utils/constants";
import { PlatformButton } from "./PlatformButton";

interface WeekViewProps {
  onEventPress: (event: Event) => void;
  onTimeSlotPress: (date: Date, hour: number) => void;
  overrideDate?: Date;
}

export const WeekView: React.FC<WeekViewProps> = ({
  onEventPress,
  onTimeSlotPress,
  overrideDate,
}) => {
  const { state } = useCalendar();
  const {
    selectedDate: contextDate,
    events,
    calendars,
    selectedCalendarIds,
  } = state;
  const selectedDate = overrideDate || contextDate;
  const { colors } = useTheme();

  // Memoize expensive calculations
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const visibleEvents = useMemo(
    () =>
      events.filter((event) => selectedCalendarIds.includes(event.calendarId)),
    [events, selectedCalendarIds]
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // Memoize calendar color lookup
  const getCalendarColor = useCallback(
    (calendarId: string): string => {
      const calendar = calendars.find((cal) => cal.id === calendarId);
      return calendar?.color || "#007AFF";
    },
    [calendars]
  );

  // Memoize event position calculation
  const getEventPosition = useCallback((event: Event, date: Date) => {
    if (!isSameDay(event.startDate, date)) return null;

    const startHour = event.startDate.getHours();
    const startMinute = event.startDate.getMinutes();
    const endHour = event.endDate.getHours();
    const endMinute = event.endDate.getMinutes();

    const top = (startHour + startMinute / 60) * 60; // 60px per hour
    const height =
      (endHour + endMinute / 60 - (startHour + startMinute / 60)) * 60;

    return { top, height: Math.max(height, 30) }; // Minimum height of 30px
  }, []);

  // Memoize day events for each date
  const dayEventsMap = useMemo(() => {
    const map = new Map<string, Event[]>();
    weekDays.forEach((date) => {
      const dateKey = date.toDateString();
      map.set(dateKey, getEventsForDate(visibleEvents, date));
    });
    return map;
  }, [weekDays, visibleEvents]);

  const renderDayEvents = useCallback(
    (date: Date) => {
      const dateKey = date.toDateString();
      const dayEvents = dayEventsMap.get(dateKey) || [];

      return dayEvents.map((event) => {
        const position = getEventPosition(event, date);
        if (!position) return null;

        return (
          <PlatformButton
            key={event.id}
            style={[
              styles.eventBlock,
              {
                top: position.top,
                height: position.height,
                backgroundColor: getCalendarColor(event.calendarId),
              },
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
          </PlatformButton>
        );
      });
    },
    [dayEventsMap, getEventPosition, getCalendarColor, onEventPress]
  );

  // Memoize time labels
  const timeLabels = useMemo(
    () =>
      hours.map((hour) => ({
        hour,
        label:
          hour === 0
            ? "12 AM"
            : hour < 12
            ? `${hour} AM`
            : hour === 12
            ? "12 PM"
            : `${hour - 12} PM`,
      })),
    [hours]
  );

  const renderTimeSlot = useCallback(
    (hour: number, date: Date, dayIndex: number) => {
      return (
        <PlatformButton
          key={`${dayIndex}-${hour}`} // Use dayIndex instead of date for better performance
          style={[styles.timeSlot, { borderBottomColor: colors.border }]}
          onPress={() => onTimeSlotPress(date, hour)}
        >
          <View />
        </PlatformButton>
      );
    },
    [onTimeSlotPress, colors.border]
  );

  const { height: windowHeight } = useWindowDimensions();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Headers row */}
      <View style={[styles.headersRow, { borderBottomColor: colors.border }]}>
        {/* Time column header */}
        <View
          style={[
            styles.timeColumnHeader,
            {
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
            },
          ]}
        />

        {/* Day headers */}
        {weekDays.map((date, index) => {
          const isToday = isSameDay(date, new Date());

          return (
            <View
              key={index}
              style={[
                styles.dayHeader,
                {
                  backgroundColor: colors.background,
                  borderBottomColor: colors.border,
                  borderRightColor: colors.border,
                },
                isToday && { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text
                style={[
                  styles.dayHeaderText,
                  { color: colors.text },
                  isToday && { color: colors.primary },
                ]}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <Text
                style={[
                  styles.dayHeaderDate,
                  { color: colors.text },
                  isToday && { color: colors.primary, fontWeight: "bold" },
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
          );
        })}
      </View>
      <View
        style={{ height: windowHeight - HEADER_HEIGHT - TIME_SLOT_HEIGHT }}
      >
        {/* Scrollable content */}
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Time slots and content */}
          <View style={styles.contentContainer}>
            {/* Time labels column */}
            <View
              style={[
                styles.timeColumn,
                {
                  backgroundColor: colors.surface,
                  borderRightColor: colors.border,
                },
              ]}
            >
              {timeLabels.map(({ hour, label }) => (
                <View
                  key={hour}
                  style={[
                    styles.timeLabel,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.timeLabelText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Days content */}
            <View style={styles.daysContent}>
              {weekDays.map((date, index) => (
                <View
                  key={index}
                  style={[
                    styles.dayContentColumn,
                    { borderRightColor: colors.border },
                  ]}
                >
                  {hours.map((hour) => renderTimeSlot(hour, date, index))}
                  <View style={styles.eventsContainer} pointerEvents="box-none">
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

const TIME_SLOT_HEIGHT = 60;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  headersRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  timeColumnHeader: {
    width: 60,
    height: TIME_SLOT_HEIGHT,
    borderRightWidth: 1,
  },
  dayHeader: {
    flex: 1,
    height: TIME_SLOT_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayHeaderDate: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    flexDirection: "row",
  },
  timeColumn: {
    width: 60,
    borderRightWidth: 1,
  },
  timeLabel: {
    height: TIME_SLOT_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  timeLabelText: {
    fontSize: 12,
    fontWeight: "500",
  },
  daysContent: {
    flex: 1,
    flexDirection: "row",
  },
  dayContentColumn: {
    flex: 1,
    position: "relative",
    borderRightWidth: 1,
  },
  timeSlot: {
    height: TIME_SLOT_HEIGHT,
    borderBottomWidth: 1,
  },
  eventsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eventBlock: {
    position: "absolute",
    left: 4,
    right: 16,
    borderRadius: 4,
    padding: 4,
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#FFFFFF",
  },
  eventTime: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.9,
  },
});
