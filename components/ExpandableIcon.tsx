import React, { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ExpandableIcon = ({ expanded }: { expanded: boolean }) => {
  const rotationAnim = useRef(new Animated.Value(expanded ? 180 : 0)).current;

  useEffect(() => {
    Animated.timing(rotationAnim, {
      toValue: expanded ? 90 : 0, // Rotate 90° when expanded
      duration: 200, // Animation duration
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            rotate: rotationAnim.interpolate({
              inputRange: [0, 90],
              outputRange: ["0deg", "90deg"],
            }),
          },
        ],
      }}
    >
      <MaterialIcons name="keyboard-arrow-right" size={24} color="#000" />
    </Animated.View>
  );
};

export default ExpandableIcon;
