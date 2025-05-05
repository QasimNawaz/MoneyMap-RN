import { ViewStyle, View, Text, Pressable, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { getBaseRouteName, icons } from "../assets/icons";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import TabIcon from "./TabIcon";

const TabBarButton: React.FC<TabBarButtonProps> = ({
  style,
  isFocused,
  label,
  routeName,
  color,
  ...props
}) => {
  const route = getBaseRouteName(routeName);
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { duration: 350 });
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.4]);
    const top = interpolate(scale.value, [0, 1], [0, 8]);

    return {
      transform: [{ scale: scaleValue }],
      top,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  });

  const isAddButton = routeName === "add";

  if (isAddButton) {
    return (
      <Pressable {...props} style={[style, {}]}>
        <TabIcon route={route} color={"#fff"} />
      </Pressable>
    );
  }

  return (
    <Pressable {...props} style={style}>
      <Animated.View style={[animatedIconStyle]}>
        <TabIcon route={route} color={color} />
      </Animated.View>

      <Animated.Text
        style={[
          {
            color,
            fontSize: 11,
          },
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});

export default TabBarButton;

// Define the type for `routeName`
type IconKeys = keyof typeof icons;

// Define the type for TabBarButton props
interface TabBarButtonProps {
  style?: ViewStyle;
  isFocused?: boolean;
  label: string;
  routeName: IconKeys;
  color: string;
  [key: string]: any; // Add support for additional props
}
