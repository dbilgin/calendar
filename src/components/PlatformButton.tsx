import React from "react";
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Platform,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";

interface PlatformButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  disabled?: boolean;
  activeOpacity?: number;
  rippleColor?: string;
  borderless?: boolean;
  background?: any;
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({
  onPress,
  style,
  children,
  disabled = false,
  activeOpacity = 0.7,
  rippleColor = "rgba(0, 0, 0, 0.1)",
  borderless = false,
  background,
}) => {
  if (Platform.OS === "ios") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={style}
        disabled={disabled}
        activeOpacity={activeOpacity}
      >
        <>{children}</>
      </TouchableOpacity>
    );
  }

  if (Platform.OS === "android") {
    const androidBackground =
      background || TouchableNativeFeedback.Ripple(rippleColor, borderless);

    return (
      <TouchableNativeFeedback
        onPress={onPress}
        disabled={disabled}
        background={androidBackground}
        useForeground={true}
      >
        <>
          <View style={style}>{children}</View>
        </>
      </TouchableNativeFeedback>
    );
  }

  // Web platform
  if (Platform.OS === "web") {
    return (
      <TouchableWithoutFeedback onPress={onPress} disabled={disabled}>
        <View
          style={
            [
              style,
              {
                cursor: disabled ? "not-allowed" : "pointer",
                userSelect: "none",
              },
              disabled && {
                opacity: 0.5,
              },
            ] as any
          }
        >
          <>{children}</>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  // Fallback for other platforms
  return (
    <TouchableWithoutFeedback onPress={onPress} disabled={disabled}>
      <View style={style}>
        <>{children}</>
      </View>
    </TouchableWithoutFeedback>
  );
};
