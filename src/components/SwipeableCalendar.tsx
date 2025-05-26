import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, useWindowDimensions } from 'react-native';
import { useCalendar } from '../contexts/CalendarContext';
import { navigateDate } from '../utils/dateUtils';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { Event } from '../types';

interface SwipeableCalendarProps {
  children: React.ReactNode;
  onEventPress: (event: Event) => void;
  onDatePress?: (date: Date) => void;
  onTimeSlotPress?: (date: Date, hour: number) => void;
}

interface CalendarPage {
  id: string;
  date: Date;
  isCenter: boolean;
}

export const SwipeableCalendar: React.FC<SwipeableCalendarProps> = ({ 
  children, 
  onEventPress, 
  onDatePress, 
  onTimeSlotPress 
}) => {
  const { state, actions } = useCalendar();
  const { selectedDate, viewMode } = state;
  const { width: screenWidth } = useWindowDimensions();
  
  const flatListRef = useRef<FlatList<CalendarPage>>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isSwipeNavigation, setIsSwipeNavigation] = useState(false);
  const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate);
  const [lastViewMode, setLastViewMode] = useState(viewMode);

  // Generate three pages based on a center date
  const generatePages = useCallback((centerDate: Date): CalendarPage[] => {
    const previousDate = navigateDate(centerDate, 'prev', viewMode);
    const nextDate = navigateDate(centerDate, 'next', viewMode);
    
    return [
      { id: `prev-${previousDate.getTime()}`, date: previousDate, isCenter: false },
      { id: `current-${centerDate.getTime()}`, date: centerDate, isCenter: true },
      { id: `next-${nextDate.getTime()}`, date: nextDate, isCenter: false },
    ];
  }, [viewMode]);

  const [pages, setPages] = useState<CalendarPage[]>(() => generatePages(selectedDate));

  // Handle external date changes (not from swipe navigation)
  useEffect(() => {
    if (!isSwipeNavigation && selectedDate.getTime() !== internalSelectedDate.getTime()) {
      setInternalSelectedDate(selectedDate);
      setPages(generatePages(selectedDate));
      
      // Reset to center page
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        setCurrentIndex(1);
      }, 0);
    }
  }, [selectedDate, isSwipeNavigation, internalSelectedDate, generatePages]);

  // Handle view mode changes
  useEffect(() => {
    if (viewMode !== lastViewMode) {
      setLastViewMode(viewMode);
      setPages(generatePages(internalSelectedDate));
      
      // Reset to center page
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
        setCurrentIndex(1);
      }, 0);
    }
  }, [viewMode, lastViewMode, internalSelectedDate, generatePages]);

  // Render the appropriate calendar view based on viewMode
  const renderCalendarView = useCallback((date: Date, isCenter: boolean) => {
    // For center page, render the original children
    if (isCenter) {
      return children;
    }

    // For adjacent pages, render with override date
    switch (viewMode) {
      case 'month':
        return (
          <MonthView
            onEventPress={onEventPress}
            onDatePress={onDatePress || (() => {})}
            overrideDate={date}
          />
        );
      case 'week':
        return (
          <WeekView
            onEventPress={onEventPress}
            onTimeSlotPress={onTimeSlotPress || (() => {})}
            overrideDate={date}
          />
        );
      case 'day':
        return (
          <DayView
            onEventPress={onEventPress}
            onTimeSlotPress={onTimeSlotPress || (() => {})}
            overrideDate={date}
          />
        );
      default:
        return (
          <MonthView
            onEventPress={onEventPress}
            onDatePress={onDatePress || (() => {})}
            overrideDate={date}
          />
        );
    }
  }, [children, viewMode, onEventPress, onDatePress, onTimeSlotPress]);

  const renderPage: ListRenderItem<CalendarPage> = useCallback(({ item }) => {
    return (
      <View style={[styles.page, { width: screenWidth }]}>
        {renderCalendarView(item.date, item.isCenter)}
      </View>
    );
  }, [renderCalendarView, screenWidth]);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const newIndex = Math.round(contentOffset.x / screenWidth);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      
      // Navigate when swiping to adjacent pages
      if (newIndex === 0) {
        // Swiped to previous page
        const newDate = pages[0].date;
        setIsSwipeNavigation(true);
        setInternalSelectedDate(newDate);
        actions.setSelectedDate(newDate);
        
        // Update pages to maintain the three-page system
        const newPages = generatePages(newDate);
        setPages(newPages);
        
        // Reset to center after updating pages
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 1, animated: false });
          setCurrentIndex(1);
          setIsSwipeNavigation(false);
        }, 0);
        
      } else if (newIndex === 2) {
        // Swiped to next page
        const newDate = pages[2].date;
        setIsSwipeNavigation(true);
        setInternalSelectedDate(newDate);
        actions.setSelectedDate(newDate);
        
        // Update pages to maintain the three-page system
        const newPages = generatePages(newDate);
        setPages(newPages);
        
        // Reset to center after updating pages
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 1, animated: false });
          setCurrentIndex(1);
          setIsSwipeNavigation(false);
        }, 0);
      }
    }
  }, [currentIndex, pages, actions, generatePages, screenWidth]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  }), [screenWidth]);

  const keyExtractor = useCallback((item: CalendarPage) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={1}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        style={styles.flatList}
        removeClippedSubviews={false} // Disable to prevent rendering issues during swipe
        nestedScrollEnabled={true} // Enable nested scrolling for vertical scroll views
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
}); 