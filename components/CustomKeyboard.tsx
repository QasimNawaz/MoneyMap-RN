import { Colors } from "@/constants/Colors";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Dimensions,
} from "react-native";

interface CustomKeyboardProps {
  onNumberSelect: (value: string) => void;
  height?: number;
  style?: StyleProp<ViewStyle>;
  buttonColor?: string;
  textColor?: string;
  fontSize?: number;
  maxDigits?: number;
}

const CustomKeyboard: React.FC<CustomKeyboardProps> = ({
  onNumberSelect,
  height = 300,
  style,
  buttonColor = "#E0E0E0", // Light gray buttons
  textColor = "#333333", // Dark gray text for readability
  fontSize = 24,
  maxDigits = 12,
}) => {
  const [currentValue, setCurrentValue] = useState<string>("0");
  const [storedValue, setStoredValue] = useState<string>("");
  const [operator, setOperator] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setCurrentValue("0");
      };
    }, [])
  );

  const buttons: string[] = [
    "7",
    "8",
    "9",
    "÷",
    "4",
    "5",
    "6",
    "×",
    "1",
    "2",
    "3",
    "-",
    "0",
    "⌫",
    "=",
    "+",
  ];

  const handlePress = (value: string) => {
    if (!isNaN(Number(value))) {
      // Check if adding the new digit would exceed maxDigits
      if (
        currentValue.replace(/[^0-9]/g, "").length >= maxDigits &&
        currentValue !== "0"
      ) {
        return; // Don't add more digits if limit reached
      }

      const newValue = currentValue === "0" ? value : currentValue + value;
      setCurrentValue(newValue);
      onNumberSelect(newValue);
    } else if (value === "⌫") {
      const newValue =
        currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
      setCurrentValue(newValue);
      onNumberSelect(newValue);
    } else if (value === "=" && operator && storedValue !== "") {
      const result = calculateResult(storedValue, currentValue, operator);
      const resultStr = result.toString();

      // Limit the result if it exceeds maxDigits
      if (resultStr.replace(/[^0-9]/g, "").length > maxDigits) {
        const limitedResult = Number(resultStr.slice(0, maxDigits));
        setCurrentValue(limitedResult.toString());
        onNumberSelect(limitedResult.toString());
      } else {
        setCurrentValue(resultStr);
        onNumberSelect(resultStr);
      }

      setStoredValue("");
      setOperator(null);
    } else if (["+", "-", "×", "÷"].includes(value)) {
      if (currentValue !== "") {
        if (storedValue === "") {
          setStoredValue(currentValue);
        } else {
          const result = calculateResult(storedValue, currentValue, operator!);
          const resultStr = result.toString();

          // Limit the result if it exceeds maxDigits
          if (resultStr.replace(/[^0-9]/g, "").length > maxDigits) {
            const limitedResult = Number(resultStr.slice(0, maxDigits));
            setStoredValue(limitedResult.toString());
            onNumberSelect(limitedResult.toString());
          } else {
            setStoredValue(resultStr);
            onNumberSelect(resultStr);
          }
        }
      }
      setOperator(value);
      setCurrentValue("0");
    }
  };

  const calculateResult = (num1: string, num2: string, op: string): number => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    switch (op) {
      case "+":
        return n1 + n2;
      case "-":
        return n1 - n2;
      case "×":
        return n1 * n2;
      case "÷":
        return n2 !== 0 ? n1 / n2 : 0;
      default:
        return n2;
    }
  };

  const buttonSize = {
    width: (Dimensions.get("window").width - 80) / 4,
    height: (height - 60) / 4,
  };

  return (
    <View style={[styles.container, { height }, style]}>
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              {
                backgroundColor: buttonColor,
                width: buttonSize.width,
                height: buttonSize.height,
              },
              ["+", "-", "×", "÷"].includes(button) && styles.operatorButton,
              button === "=" && styles.equalButton,
            ]}
            onPress={() => handlePress(button)}
          >
            <Text style={[styles.buttonText, { color: textColor, fontSize }]}>
              {button}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F5F5F5", // Soft gray for contrast with white background
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
  },
  operatorButton: {
    backgroundColor: Colors.warnOrange, // Orange for operators
  },
  equalButton: {
    backgroundColor: Colors.softTeal, // Blue for "="
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "500",
  },
});

export default CustomKeyboard;
