import { ThemedView } from "@/components/ThemedView";
import { AnimatedThemedText } from "@/components/AnimatedThemedText";
import React from "react";
import { Image } from "expo-image";
import { StyleSheet, Dimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

const OnboardingPage = ({
  item,
  index,
  translateX,
}: {
  item: any;
  index: number;
  translateX: Animated.SharedValue<number>;
}) => {
  const progress = translateX.value / width - index;
  const theme = useColorScheme();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(
          interpolate(progress, [1, 0, -1], [width, 0, -width], "clamp")
        ),
      },
    ],
  }));

  const secondaryOnBackground =
    theme === "dark"
      ? Colors.dark.secondaryOnBackground
      : Colors.light.secondaryOnBackground;

  return (
    <ThemedView style={styles.page}>
      <StatusBar
        style="auto"
        translucent={true}
        backgroundColor="transparent"
      />
      {/* Cloud Image with Icon */}
      <Animated.View style={[styles.cloudContainer, animatedStyle]}>
        <Image
          source={item.cloud}
          style={styles.cloudImage}
          contentFit="fill"
        />
      </Animated.View>

      {/* Main Image */}
      <Animated.View style={[styles.cloudContainer, animatedStyle]}>
        <Image source={item.mainImage} style={styles.mainImage} />
      </Animated.View>

      {/* Title */}
      <AnimatedThemedText style={[styles.title, animatedStyle]}>
        {item.title}
      </AnimatedThemedText>

      {/* Description */}
      <AnimatedThemedText
        style={[
          styles.description,
          animatedStyle,
          { color: secondaryOnBackground },
        ]}
      >
        {item.description}
      </AnimatedThemedText>
    </ThemedView>
  );
};

export default OnboardingPage;

const styles = StyleSheet.create({
  page: {
    width,
  },
  cloudContainer: {
    width: "100%",
    height: "40%",
    alignItems: "center",
    justifyContent: "center",
  },
  cloudImage: {
    flex: 1,
    width: "100%",
  },
  iconContainer: {
    position: "absolute",
    bottom: 10,
    flexDirection: "column",
    alignItems: "center",
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  mainImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
    // color: "#8A9197",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#333",
  },
});
