import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  useColorScheme,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

const { width: screenWidth } = Dimensions.get("window");

interface GradientButtonProps {
  colors?: readonly [string, string, ...string[]];
  onPress: () => void;
  text: string;
  textStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  gradientStyle?: StyleProp<ViewStyle>;
  width?: number | string; // Optional width
}

const GradientButton: React.FC<GradientButtonProps> = ({
  colors,
  onPress,
  text,
  textStyle,
  buttonStyle,
  gradientStyle,
  width = "100%", // Default to full width
}) => {
  const theme = useColorScheme();
  const gradientColors =
    theme === "dark" ? Colors.dark.gradient : Colors.light.gradient;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width: width as ViewStyle["width"] }, // Use the passed width or default
        buttonStyle,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={colors || gradientColors}
        start={{ x: 0, y: 0 }} // Left to right gradient
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, gradientStyle]}
      >
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    overflow: "hidden", // Ensures the gradient is clipped to rounded corners
    alignSelf: "center", // Ensures centering when width is not full
  },
  gradient: {
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
