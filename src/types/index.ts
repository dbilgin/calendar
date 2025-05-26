export interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  calendarId: string;
  location?: string;
  reminder?: number; // minutes before event
  createdAt: Date;
  updatedAt: Date;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface CalendarState {
  calendars: Calendar[];
  events: Event[];
  selectedDate: Date;
  viewMode: ViewMode;
  selectedCalendarIds: string[];
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  calendarId: string;
  location?: string;
  reminder?: number;
}

export interface CreateCalendarData {
  name: string;
  color: string;
}

export interface EventFormData extends CreateEventData {
  id?: string;
}

export interface CalendarFormData extends CreateCalendarData {
  id?: string;
} 