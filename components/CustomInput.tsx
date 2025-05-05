import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  DimensionValue,
  ColorValue,
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import { Colors } from "@/constants/Colors"; // Assuming this is where your colors are defined

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  maxLength?: number;
  width?: DimensionValue | undefined;
  customColors?: {
    focused?: string | undefined;
    unfocused?: string | undefined;
    error?: string | undefined;
  };
  style?: ViewStyle;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  maxLength,
  width = "100%",
  customColors,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Colors for different states
  const unfocusedColor = customColors?.unfocused ?? "#999";
  const focusedColor = customColors?.focused ?? Colors.warnOrange;
  const errorColor = customColors?.error ?? "red";

  return (
    <View style={[styles.container, { width }, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="flat"
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        error={!!error}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        underlineColor={
          error ? errorColor : isFocused ? focusedColor : unfocusedColor
        }
        activeUnderlineColor={error ? errorColor : focusedColor}
        outlineColor={
          error ? errorColor : isFocused ? focusedColor : unfocusedColor
        }
        activeOutlineColor={error ? errorColor : focusedColor}
        style={[styles.input, { width: "100%" }]}
        theme={{
          colors: {
            primary: focusedColor,
            error: errorColor,
          },
        }}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginVertical: 8,
    width: "100%",
  },
  input: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default CustomInput;
