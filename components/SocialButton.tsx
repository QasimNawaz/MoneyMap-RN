import React from "react";
import { View, StyleSheet, Image, ImageSourcePropType } from "react-native";
import { useColorScheme } from "react-native"; // For theme-based styling
import { Colors } from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const SocialButton = ({
  height = 50,
  width = 50,
  iconName, // Now it supports either an icon name or a local image
  iconSize = 40,
  imageSource, // Add this prop to support local images
}: {
  height?: number;
  width?: number;
  iconName?: any; // Icon name for MaterialIcons (optional)
  iconSize?: number;
  imageSource?: ImageSourcePropType; // For local images
}) => {
  const theme = useColorScheme();
  const secondaryOnBackground =
    theme === "dark"
      ? Colors.dark.secondaryOnBackground
      : Colors.light.secondaryOnBackground;

  const styles = StyleSheet.create({
    circle: {
      width: width, // Circle diameter
      height: height, // Circle diameter
      borderRadius: 50, // Makes the view circular
      borderWidth: 1,
      borderColor: secondaryOnBackground,
      justifyContent: "center",
      marginHorizontal: 15,
      alignItems: "center",
    },
    icon: {
      color: theme === "dark" ? Colors.dark.icon : Colors.light.icon,
    },
    image: {
      width: iconSize,
      height: iconSize,
      resizeMode: "contain", // Ensures the image fits within its bounds
    },
  });

  return (
    <View style={styles.circle}>
      {imageSource ? (
        <Image source={imageSource} style={styles.image} />
      ) : (
        iconName && (
          <FontAwesome name={iconName} size={iconSize} style={styles.icon} />
        )
      )}
    </View>
  );
};

export default SocialButton;
