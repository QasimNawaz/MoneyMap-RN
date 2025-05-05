import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export enum ToolbarAction {
  LEFT_ICON = "leftIcon",
  RIGHT_ICON = "rightIcon",
  TITLE = "title",
  SEARCH = "search",
}

export interface ToolbarProps {
  leftImage?: ImageSourcePropType; // Optional left image
  leftIcon?: React.ReactNode; // Optional left icon (e.g., Ionicons)
  title?: string; // Optional center text
  rightIcon?: React.ReactNode; // Optional right icon (e.g., MaterialIcons)
  theme?: "light" | "dark"; // Optional theme (light or dark)
  onActionPress?: (action: ToolbarAction) => void; // Universal click handler for all actions
  titleAlignment?: "center" | "left"; // Option for title position
  backgroundColor?: string; // ✅ Optional toolbar background color
  showSearch?: boolean;
  onSearch?: (text: string) => void;
  searchPlaceholder?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  leftImage,
  leftIcon,
  title,
  rightIcon,
  theme = "light", // Default to 'light' theme
  onActionPress,
  titleAlignment = "center", // Default title alignment to 'center'
  backgroundColor = "transparent", // ✅ Default background color
  showSearch = false,
  onSearch,
  searchPlaceholder = "Search...",
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");
  // Determine the icon and text colors based on the theme
  const iconColor = theme === "light" ? "black" : "white";
  const textColor = theme === "light" ? "black" : "white";

  const handleSearch = (text: string) => {
    setSearchText(text);
    onSearch?.(text);
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchText("");
      onSearch?.("");
    }
  };

  const handlePress = (action: ToolbarAction) => {
    if (onActionPress) {
      onActionPress(action); // Trigger the action for the corresponding component
    }
  };

  return (
    <View style={[styles.toolbar, { backgroundColor }]}>
      {!isSearchActive ? (
        <>
          {/* Normal Toolbar Content */}
          {leftImage && (
            <Image source={leftImage} style={styles.toolbarImage} />
          )}
          {leftIcon && (
            <TouchableOpacity
              style={styles.leftIconContainer}
              onPress={() => onActionPress?.(ToolbarAction.LEFT_ICON)}
            >
              {React.cloneElement(leftIcon as React.ReactElement, {
                color: iconColor,
              })}
            </TouchableOpacity>
          )}

          {title && !isSearchActive && (
            <Text
              style={[
                styles.toolbarTitle,
                {
                  color: textColor,
                  textAlign: titleAlignment === "center" ? "center" : "left",
                  flex: titleAlignment === "center" ? 1 : undefined,
                },
              ]}
              numberOfLines={1}
              onPress={() => onActionPress?.(ToolbarAction.TITLE)}
            >
              {title}
            </Text>
          )}

          {showSearch && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={toggleSearch}
            >
              <MaterialIcons name="search" size={24} color={iconColor} />
            </TouchableOpacity>
          )}

          {rightIcon && !showSearch && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={() => onActionPress?.(ToolbarAction.RIGHT_ICON)}
            >
              {React.cloneElement(rightIcon as React.ReactElement, {
                color: iconColor,
              })}
            </TouchableOpacity>
          )}
        </>
      ) : (
        // Search Bar View
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={toggleSearch}>
            <MaterialIcons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme === "light" ? "#666" : "#999"}
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <MaterialIcons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
  },
  toolbarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  leftIconContainer: {},
  toolbarTitle: {
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: "bold",
  },
  rightIconContainer: {
    marginLeft: "auto",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 8,
  },
});

export default Toolbar;
