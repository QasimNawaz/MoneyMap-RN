import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import OnboardingPage from "./OnboardingPage";
import { setOnboardingDone } from "@/utils/storage";
import { hasAccounts } from "@/db/query/accountQueries";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function Onboarding() {
  console.log("OnboardingScreen");
  const { width } = Dimensions.get("window");
  const [currentPage, setCurrentPage] = useState(0);
  const translateX = useSharedValue(0);
  const [hasExistingAccounts, setHasExistingAccounts] = useState(false);
  const { drizzleDb } = useDrizzleDatabase();
  const { typedReplace } = useTypedRouter();

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const accountsExist = await hasAccounts(drizzleDb);
        setHasExistingAccounts(accountsExist);
      } catch (err) {
        console.error("Error loading accounts:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  const completeOnboarding = async () => {
    await setOnboardingDone(true);
    if (hasExistingAccounts) {
      // router.replace("/(tabs)/index");
      typedReplace("(tabs)");
      return;
    } else {
      // router.replace("/(first-account)");
      typedReplace("(first-account)");
      return;
    }
  };

  type Page = {
    iconPosition: "flex-start" | "center" | "flex-end";
    cloud: any;
    mainImage: any;
    title: string;
    description: string;
  };

  const pages: Page[] = [
    {
      iconPosition: "flex-start",
      cloud: require("@assets/images/ob-header-one.png"), // Replace with your cloud image path
      mainImage: require("@assets/images/ob-one.png"), // Replace with your main image path
      title: "Gain total control of your money",
      description: `Become your own money manager and make every cent count`,
    },
    {
      iconPosition: "center",
      cloud: require("@assets/images/ob-header-two.png"),
      mainImage: require("@assets/images/ob-two.png"),
      title: "Know where your money goes",
      description: `Track your transaction easily, with categories and financial report `,
    },
    {
      iconPosition: "flex-end",
      cloud: require("@assets/images/ob-header-three.png"),
      mainImage: require("@assets/images/ob-three.png"),
      title: "Planning ahead",
      description: `Setup your budget for each category so you in control`,
    },
  ];

  const doneTextStyle = useAnimatedStyle(() => ({
    opacity: withTiming(currentPage === 2 ? 1 : 0), // Show only on page 3
    transform: [
      { scale: withTiming(currentPage === 2 ? 1 : 0.9) }, // Subtle scaling effect
    ],
  }));

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    translateX.value = offset; // Update scroll position
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={pages}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <OnboardingPage item={item} index={index} translateX={translateX} />
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentPage(index);
        }}
      />

      {/* Animated "Done" Text */}
      <ThemedView style={[styles.doneTextContainer]}>
        <Pressable onPress={completeOnboarding}>
          <Animated.Text style={[styles.doneText, doneTextStyle]}>
            Done
          </Animated.Text>
        </Pressable>
      </ThemedView>

      {/* Page Indicator */}
      <ThemedView style={styles.indicatorContainer}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentPage === index && styles.activeIndicator,
            ]}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  doneTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  doneText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryColor,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.primaryColor,
  },
});
