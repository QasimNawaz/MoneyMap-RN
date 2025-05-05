import React, { useState, useRef, useEffect } from "react";
import { TextInput, View, Text, Animated, StyleSheet } from "react-native";

interface OutlinedTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  width?: number | string;
  borderColor?: string;
  focusBorderColor?: string;
  labelColor?: string;
  focusLabelColor?: string;
  textColor?: string;
}

const OutlinedTextField: React.FC<OutlinedTextFieldProps> = ({
  label,
  value,
  onChangeText,
  width = "100%",
  borderColor = "#aaa",
  focusBorderColor = "#6200EE",
  labelColor = "#aaa",
  focusLabelColor = "#6200EE",
  textColor = "#000",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -10],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: isFocused ? focusLabelColor : labelColor,
  };

  return (
    <View
      style={[
        styles.container,
        { width, borderColor: isFocused ? focusBorderColor : borderColor },
      ]}
    >
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    position: "relative",
    marginVertical: 10,
  },
  label: {
    position: "absolute",
    left: 12,
    backgroundColor: "white",
    paddingHorizontal: 4,
  },
  input: {
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
});

export default OutlinedTextField;
