import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/Colors";

interface GenericTextInputProps {
  placeholder: string;
  onChangeText: (text: string) => void;
  value: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  radius?: number; // Optional radius (default to 10)
  width?: string | number; // Optional width (default to 100%)
}

const GenericTextInput: React.FC<GenericTextInputProps> = ({
  placeholder,
  onChangeText,
  value,
  style,
  inputStyle,
  radius = 10, // Default radius
  width = "100%", // Default width
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useColorScheme();

  const borderColor = isFocused
    ? theme === "dark"
      ? Colors.dark.primaryColor
      : Colors.light.primaryColor
    : "#D3D3D3"; // Light grey when unfocused

  return (
    <View
      style={[
        styles.container,
        { borderColor, borderRadius: radius, width: width as any },
        style,
      ]}
    >
      <RNTextInput
        style={[
          styles.input,
          {
            color:
              theme === "dark"
                ? Colors.dark.onBackground
                : Colors.light.onBackground,
          },
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={
          theme === "dark" ? Colors.dark.icon : Colors.light.icon
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChangeText={onChangeText}
        value={value}
      />
    </View>
  );
};

export default GenericTextInput;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    alignSelf: "center", // Ensures it stays centered when custom widths are applied
  },
  input: {
    fontSize: 16,
    padding: 0, // Removes default padding
  },
});
