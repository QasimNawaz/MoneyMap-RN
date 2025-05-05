import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

interface NumericKeyboardProps {
  onNumberSelect: (value: string) => void;
  onConfirm: () => void;
  style?: StyleProp<ViewStyle>;
  maxDigits?: number;
}

const NumericKeyboard: React.FC<NumericKeyboardProps> = ({
  onNumberSelect,
  onConfirm,
  style,
  maxDigits = 12,
}) => {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [currentValue, setCurrentValue] = useState<string>("0");

  const buttons: (string | "delete" | "confirm")[] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "delete",
    "0",
    "confirm",
  ];

  // Calculate dynamic sizes based on screen dimensions
  const keyboardHeight = windowHeight * 0.45; // 45% of screen height
  const buttonSize = {
    width: (windowWidth - 60) / 3,
    height: (keyboardHeight - 40) / 4,
  };

  // Ensure minimum and maximum button sizes
  const clampedButtonSize = {
    width: Math.min(Math.max(buttonSize.width, 60), 120),
    height: Math.min(Math.max(buttonSize.height, 50), 90),
  };

  const handlePress = (value: string | "delete" | "confirm") => {
    if (value === "confirm") {
      onConfirm();
      return;
    }

    if (value === "delete") {
      const newValue =
        currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
      setCurrentValue(newValue);
      onNumberSelect(newValue);
      return;
    }

    if (currentValue.length >= maxDigits && currentValue !== "0") {
      return;
    }

    const newValue = currentValue === "0" ? value : currentValue + value;
    setCurrentValue(newValue);
    onNumberSelect(newValue);
  };

  return (
    <View style={[styles.container, { height: keyboardHeight }, style]}>
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              {
                width: clampedButtonSize.width,
                height: clampedButtonSize.height,
              },
              (button === "delete" || button === "confirm") &&
                styles.actionButton,
            ]}
            onPress={() => handlePress(button)}
          >
            {typeof button === "string" &&
            !["delete", "confirm"].includes(button) ? (
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: Math.min(clampedButtonSize.height * 0.4, 24) },
                ]}
              >
                {button}
              </Text>
            ) : (
              <MaterialIcons
                name={button === "delete" ? "backspace" : "check"}
                size={Math.min(clampedButtonSize.height * 0.35, 24)}
                color={theme.colors.white}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  actionButton: {
    backgroundColor: theme.colors.softTeal,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "500",
    color: theme.colors.onSurface,
  },
});

export default NumericKeyboard;
