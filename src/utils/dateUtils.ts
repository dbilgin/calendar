import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isWithinInterval,
  parseISO,
  formatISO,
} from 'date-fns';

// Re-export date-fns functions for convenience
export { isSameDay, isSameWeek, isSameMonth };
import { Event, ViewMode } from '../types';

export const formatDate = (date: Date, formatString: string = 'yyyy-MM-dd'): string => {
  return format(date, formatString);
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMMM d, yyyy');
};

export const formatDisplayTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const getWeekStart = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday start
};

export const getWeekEnd = (date: Date): Date => {
  return endOfWeek(date, { weekStartsOn: 1 });
};

export const getMonthStart = (date: Date): Date => {
  return startOfMonth(date);
};

export const getMonthEnd = (date: Date): Date => {
  return endOfMonth(date);
};

export const getDayStart = (date: Date): Date => {
  return startOfDay(date);
};

export const getDayEnd = (date: Date): Date => {
  return endOfDay(date);
};

export const getViewDateRange = (date: Date, viewMode: ViewMode): { start: Date; end: Date } => {
  switch (viewMode) {
    case 'day':
      return { start: getDayStart(date), end: getDayEnd(date) };
    case 'week':
      return { start: getWeekStart(date), end: getWeekEnd(date) };
    case 'month':
      return { start: getMonthStart(date), end: getMonthEnd(date) };
    default:
      return { start: getDayStart(date), end: getDayEnd(date) };
  }
};

export const navigateDate = (date: Date, direction: 'prev' | 'next', viewMode: ViewMode): Date => {
  switch (viewMode) {
    case 'day':
      return direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    case 'week':
      return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
    case 'month':
      return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
    default:
      return date;
  }
};

export const getEventsForDate = (events: Event[], date: Date): Event[] => {
  return events.filter(event => {
    if (event.isAllDay) {
      return isSameDay(event.startDate, date) || 
             (event.startDate <= date && event.endDate >= date);
    }
    return isSameDay(event.startDate, date);
  });
};

export const getEventsForDateRange = (events: Event[], startDate: Date, endDate: Date): Event[] => {
  return events.filter(event => {
    return isWithinInterval(event.startDate, { start: startDate, end: endDate }) ||
           isWithinInterval(event.endDate, { start: startDate, end: endDate }) ||
           (event.startDate <= startDate && event.endDate >= endDate);
  });
};

export const getWeekDays = (date: Date): Date[] => {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const getMonthDays = (date: Date): Date[] => {
  const start = getMonthStart(date);
  const end = getMonthEnd(date);
  const days: Date[] = [];
  
  let current = start;
  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }
  
  return days;
};

export const getCalendarGrid = (date: Date): Date[] => {
  const monthStart = getMonthStart(date);
  const calendarStart = getWeekStart(monthStart);
  
  // Always generate exactly 6 weeks (42 days) for consistent layout
  const days: Date[] = [];
  let current = calendarStart;
  
  for (let i = 0; i < 42; i++) {
    days.push(current);
    current = addDays(current, 1);
  }
  
  return days;
};

export const isEventInView = (event: Event, date: Date, viewMode: ViewMode): boolean => {
  const { start, end } = getViewDateRange(date, viewMode);
  
  return isWithinInterval(event.startDate, { start, end }) ||
         isWithinInterval(event.endDate, { start, end }) ||
         (event.startDate <= start && event.endDate >= end);
};

export const sortEventsByTime = (events: Event[]): Event[] => {
  return [...events].sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.startDate.getTime() - b.startDate.getTime();
  });
};

export const createDateFromTimeString = (dateBase: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(dateBase);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

export const getTimeString = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const getDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
}; 