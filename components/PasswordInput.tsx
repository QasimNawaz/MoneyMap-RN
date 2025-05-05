import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface PasswordInputProps {
  placeholder: string;
  onChangeText: (text: string) => void;
  value: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  radius?: number; // Optional radius (default to 10)
  width?: string | number; // Optional width (default to 100%)
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
  onChangeText,
  value,
  style,
  inputStyle,
  radius = 10, // Default radius
  width = "100%", // Default width
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const theme = useColorScheme();

  const borderColor = isFocused
    ? theme === "dark"
      ? Colors.dark.primaryColor
      : Colors.light.primaryColor
    : "#D3D3D3"; // Light grey when unfocused

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

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
        secureTextEntry={!isPasswordVisible}
      />
      <TouchableOpacity
        onPress={togglePasswordVisibility}
        style={styles.iconContainer}
      >
        <MaterialIcons
          name={isPasswordVisible ? "visibility" : "visibility-off"}
          size={24}
          color={theme === "dark" ? Colors.dark.icon : Colors.light.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    padding: 0, // Removes default padding
    flex: 1, // Takes all available space
  },
  iconContainer: {
    marginLeft: 8, // Adds space between input and icon
  },
});
