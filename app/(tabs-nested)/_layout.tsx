import { BaseBottomSheet } from "@/components/BaseBottomSheet";
import { TransitionPresets } from "@react-navigation/bottom-tabs";
import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NestedLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            ...TransitionPresets.FadeTransition,
            gestureEnabled: true,
            gestureDirection: "horizontal",
          }}
        >
          <Stack.Screen
            name="profile/index"
            options={{
              title: "Profile",
              // animation: "slide_from_right",
            }}
          />

          <Stack.Screen
            name="categories/index"
            options={{
              title: "Categories",
              // animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="categories/sub-categories/index"
            options={{
              title: "Sub Categories",
              // animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="categories/add-sub-category/index"
            options={{
              title: "Add Sub Category",
              presentation: "transparentModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="categories/edit-sub-category/index"
            options={{
              title: "Edit SubCategory",
              presentation: "transparentModal",
              animation: "slide_from_bottom",
            }}
          />

          <Stack.Screen
            name="labels/index"
            options={{
              title: "Labels",
              // animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="templates/index"
            options={{
              title: "Templates",
              // animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="notification/index"
            options={{
              title: "Notifications",
              // animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="about/index"
            options={{
              title: "About",
              // animation: "slide_from_right",
            }}
          />
        </Stack>
        <BaseBottomSheet />
      </View>
    </SafeAreaView>
  );
}
