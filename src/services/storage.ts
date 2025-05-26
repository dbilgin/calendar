import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, Event } from '../types';

const CALENDARS_KEY = 'calendars_key';
const EVENTS_KEY = 'events_key';

export class StorageService {
  // Calendar operations
  static async getCalendars(): Promise<Calendar[]> {
    try {
      const calendarsJson = await AsyncStorage.getItem(CALENDARS_KEY);
      if (!calendarsJson) return [];
      
      const calendars = JSON.parse(calendarsJson);
      return calendars.map((calendar: any) => ({
        ...calendar,
        createdAt: new Date(calendar.createdAt),
        updatedAt: new Date(calendar.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting calendars:', error);
      return [];
    }
  }

  static async saveCalendars(calendars: Calendar[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CALENDARS_KEY, JSON.stringify(calendars));
    } catch (error) {
      console.error('Error saving calendars:', error);
      throw error;
    }
  }

  static async addCalendar(calendar: Calendar): Promise<void> {
    try {
      const calendars = await this.getCalendars();
      calendars.push(calendar);
      await this.saveCalendars(calendars);
    } catch (error) {
      console.error('Error adding calendar:', error);
      throw error;
    }
  }

  static async updateCalendar(updatedCalendar: Calendar): Promise<void> {
    try {
      const calendars = await this.getCalendars();
      const index = calendars.findIndex(cal => cal.id === updatedCalendar.id);
      if (index !== -1) {
        calendars[index] = updatedCalendar;
        await this.saveCalendars(calendars);
      }
    } catch (error) {
      console.error('Error updating calendar:', error);
      throw error;
    }
  }

  static async deleteCalendar(calendarId: string): Promise<void> {
    try {
      const calendars = await this.getCalendars();
      const filteredCalendars = calendars.filter(cal => cal.id !== calendarId);
      await this.saveCalendars(filteredCalendars);
      
      // Also delete all events from this calendar
      const events = await this.getEvents();
      const filteredEvents = events.filter(event => event.calendarId !== calendarId);
      await this.saveEvents(filteredEvents);
    } catch (error) {
      console.error('Error deleting calendar:', error);
      throw error;
    }
  }

  // Event operations
  static async getEvents(): Promise<Event[]> {
    try {
      const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
      if (!eventsJson) return [];
      
      const events = JSON.parse(eventsJson);
      return events.map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  static async saveEvents(events: Event[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events:', error);
      throw error;
    }
  }

  static async addEvent(event: Event): Promise<void> {
    try {
      const events = await this.getEvents();
      events.push(event);
      await this.saveEvents(events);
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  static async updateEvent(updatedEvent: Event): Promise<void> {
    try {
      const events = await this.getEvents();
      const index = events.findIndex(event => event.id === updatedEvent.id);
      if (index !== -1) {
        events[index] = updatedEvent;
        await this.saveEvents(events);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const events = await this.getEvents();
      const filteredEvents = events.filter(event => event.id !== eventId);
      await this.saveEvents(filteredEvents);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CALENDARS_KEY, EVENTS_KEY]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
} 