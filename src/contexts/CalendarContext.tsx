import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Calendar, Event, ViewMode, CalendarState, CreateEventData, CreateCalendarData } from '../types';
import { StorageService } from '../services/storage';
import { generateId, getRandomColor } from '../utils/helpers';

interface CalendarContextType {
  state: CalendarState;
  actions: {
    // Calendar actions
    addCalendar: (data: CreateCalendarData) => Promise<void>;
    updateCalendar: (calendar: Calendar) => Promise<void>;
    deleteCalendar: (calendarId: string) => Promise<void>;
    toggleCalendarVisibility: (calendarId: string) => Promise<void>;
    
    // Event actions
    addEvent: (data: CreateEventData) => Promise<void>;
    updateEvent: (event: Event) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    
    // View actions
    setSelectedDate: (date: Date) => void;
    setViewMode: (mode: ViewMode) => void;
    
    // Data actions
    loadData: () => Promise<void>;
    clearAllData: () => Promise<void>;
  };
}

type CalendarAction =
  | { type: 'SET_CALENDARS'; payload: Calendar[] }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: CalendarState = {
  calendars: [],
  events: [],
  selectedDate: new Date(),
  viewMode: 'month',
  selectedCalendarIds: [],
};

const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'SET_CALENDARS':
      return {
        ...state,
        calendars: action.payload,
        selectedCalendarIds: action.payload.filter(cal => cal.isVisible).map(cal => cal.id),
      };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    default:
      return state;
  }
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(calendarReducer, initialState);

  const loadData = async () => {
    try {
      const [calendars, events] = await Promise.all([
        StorageService.getCalendars(),
        StorageService.getEvents(),
      ]);

      // If no calendars exist, create a default one
      if (calendars.length === 0) {
        const defaultCalendar: Calendar = {
          id: generateId(),
          name: 'Personal',
          color: '#45B7D1',
          isVisible: true,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await StorageService.addCalendar(defaultCalendar);
        dispatch({ type: 'SET_CALENDARS', payload: [defaultCalendar] });
      } else {
        dispatch({ type: 'SET_CALENDARS', payload: calendars });
      }

      dispatch({ type: 'SET_EVENTS', payload: events });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addCalendar = async (data: CreateCalendarData) => {
    try {
      const newCalendar: Calendar = {
        id: generateId(),
        name: data.name,
        color: data.color,
        isVisible: true,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.addCalendar(newCalendar);
      const calendars = await StorageService.getCalendars();
      dispatch({ type: 'SET_CALENDARS', payload: calendars });
    } catch (error) {
      console.error('Error adding calendar:', error);
      throw error;
    }
  };

  const updateCalendar = async (calendar: Calendar) => {
    try {
      const updatedCalendar = { ...calendar, updatedAt: new Date() };
      await StorageService.updateCalendar(updatedCalendar);
      const calendars = await StorageService.getCalendars();
      dispatch({ type: 'SET_CALENDARS', payload: calendars });
    } catch (error) {
      console.error('Error updating calendar:', error);
      throw error;
    }
  };

  const deleteCalendar = async (calendarId: string) => {
    try {
      await StorageService.deleteCalendar(calendarId);
      const [calendars, events] = await Promise.all([
        StorageService.getCalendars(),
        StorageService.getEvents(),
      ]);
      dispatch({ type: 'SET_CALENDARS', payload: calendars });
      dispatch({ type: 'SET_EVENTS', payload: events });
    } catch (error) {
      console.error('Error deleting calendar:', error);
      throw error;
    }
  };

  const toggleCalendarVisibility = async (calendarId: string) => {
    try {
      const calendar = state.calendars.find(cal => cal.id === calendarId);
      if (calendar) {
        await updateCalendar({ ...calendar, isVisible: !calendar.isVisible });
      }
    } catch (error) {
      console.error('Error toggling calendar visibility:', error);
      throw error;
    }
  };

  const addEvent = async (data: CreateEventData) => {
    try {
      const newEvent: Event = {
        id: generateId(),
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        isAllDay: data.isAllDay,
        calendarId: data.calendarId,
        location: data.location,
        reminder: data.reminder,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.addEvent(newEvent);
      const events = await StorageService.getEvents();
      dispatch({ type: 'SET_EVENTS', payload: events });
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (event: Event) => {
    try {
      const updatedEvent = { ...event, updatedAt: new Date() };
      await StorageService.updateEvent(updatedEvent);
      const events = await StorageService.getEvents();
      dispatch({ type: 'SET_EVENTS', payload: events });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await StorageService.deleteEvent(eventId);
      const events = await StorageService.getEvents();
      dispatch({ type: 'SET_EVENTS', payload: events });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const setSelectedDate = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  const setViewMode = (mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const clearAllData = async () => {
    try {
      await StorageService.clearAllData();
      dispatch({ type: 'SET_CALENDARS', payload: [] });
      dispatch({ type: 'SET_EVENTS', payload: [] });
      await loadData(); // Reload to create default calendar
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const contextValue: CalendarContextType = {
    state,
    actions: {
      addCalendar,
      updateCalendar,
      deleteCalendar,
      toggleCalendarVisibility,
      addEvent,
      updateEvent,
      deleteEvent,
      setSelectedDate,
      setViewMode,
      loadData,
      clearAllData,
    },
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}; 