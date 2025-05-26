import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { useCalendar } from "../contexts/CalendarContext";
import { formatDisplayDate, navigateDate } from "../utils/dateUtils";
import { ViewMode } from "../types";

interface CalendarHeaderProps {
  onAddEvent: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onAddEvent,
}) => {
  const { state, actions } = useCalendar();
  const { selectedDate, viewMode } = state;
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 768;
  const isMobile = width < 768;
  const isVerySmall = width < 400;

  // Animation for the WIP banner dots
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handlePrevious = () => {
    const newDate = navigateDate(selectedDate, "prev", viewMode);
    actions.setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = navigateDate(selectedDate, "next", viewMode);
    actions.setSelectedDate(newDate);
  };

  const handleToday = () => {
    actions.setSelectedDate(new Date());
  };

  const handleViewModeChange = (mode: ViewMode) => {
    actions.setViewMode(mode);
  };

  const getDateDisplayText = () => {
    switch (viewMode) {
      case "day":
        return formatDisplayDate(selectedDate);
      case "week":
        return `Week of ${formatDisplayDate(selectedDate)}`;
      case "month":
        return selectedDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      default:
        return formatDisplayDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Work in Progress Banner */}
      <View style={styles.wipBanner}>
        <View style={styles.wipOverlay} />
        <View style={styles.wipContent}>
          <Ionicons name="construct" size={16} color="#FFFFFF" />
          <Text style={styles.wipText}>Work in Progress</Text>
          <View style={styles.wipDots}>
            <Animated.View style={[styles.wipDot, styles.wipDot1, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.wipDot, styles.wipDot2, { opacity: Animated.multiply(pulseAnim, 0.7) }]} />
            <Animated.View style={[styles.wipDot, styles.wipDot3, { opacity: Animated.multiply(pulseAnim, 0.4) }]} />
          </View>
        </View>
      </View>

      {/* Single Row with all elements */}
      <View style={styles.singleRow}>
        {/* Left Section - Hamburger and Title */}
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.hamburgerMenu}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          >
            <Ionicons name="menu" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={[styles.title, isVerySmall && styles.titleSmall]}>Calendar</Text>
        </View>

        {/* Center Section - Date Navigation (hidden on mobile) */}
        {!isMobile && (
          <View style={styles.centerSection}>
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={20} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateContainer} onPress={handleToday}>
              <Text style={styles.dateText}>{getDateDisplayText()}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Right Section - Today, Plus, and View Mode */}
        <View style={styles.rightSection}>
          {!isVerySmall && (
            <TouchableOpacity style={styles.todayButton} onPress={handleToday}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton} onPress={onAddEvent}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>

          {/* View Mode Selector */}
          <View style={styles.viewModeContainer}>
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewModeButton,
                  viewMode === mode && styles.viewModeButtonActive,
                ]}
                onPress={() => handleViewModeChange(mode)}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    viewMode === mode && styles.viewModeTextActive,
                  ]}
                >
                  {isMobile ? mode.charAt(0).toUpperCase() : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  singleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 40,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  hamburgerMenu: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    zIndex: 1000,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 16,
  },
  titleSmall: {
    fontSize: 20,
  },
  centerSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "center",
  },
  navButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F8F9FA",
  },
  dateContainer: {
    alignItems: "center",
    paddingHorizontal: 12,
    minWidth: 150,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  actionButton: {
    padding: 6,
    marginLeft: 6,
    borderRadius: 6,
    backgroundColor: "#F8F9FA",
  },
  viewModeContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 6,
    padding: 2,
    marginLeft: 8,
  },
  viewModeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewModeButtonActive: {
    backgroundColor: "#007AFF",
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
  },
  viewModeTextActive: {
    color: "#FFFFFF",
  },
  wipBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#FF6B35",
    zIndex: 1001,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#E55A2B",
    shadowColor: "#FF6B35",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  wipOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    opacity: 0.3,
  },
  wipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  wipDots: {
    flexDirection: "row",
    gap: 3,
  },
  wipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  wipDot1: {
    opacity: 1,
  },
  wipDot2: {
    opacity: 0.7,
  },
  wipDot3: {
    opacity: 0.4,
  },
});
