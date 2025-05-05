import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useEffect, useState } from "react";
import "react-native-reanimated";
import SplashProvider from "../context/SplashProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import { Suspense } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SQLiteProvider, openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { DATABASE_NAME } from "@/db/dbConfig";
import { BottomSheetProvider } from "@/context/BottomSheetProvider";
import { BaseBottomSheet } from "@/components/BaseBottomSheet";
import { Stack } from "expo-router";
import { theme } from "../constants/theme";
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from "react-native-paper";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const drizzledb = drizzle(expoDb);
  const { success, error } = useMigrations(drizzledb, migrations);

  useEffect(() => {
    if (fontsError) throw fontsError;
    if (error) throw error;
  }, [fontsError, error]);

  if (!fontsLoaded || !success) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <BottomSheetProvider>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
        >
          <PaperProvider theme={theme}>
            <GestureHandlerRootView>
              <SplashProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />

                  <Stack.Screen
                    name="(onboarding)"
                    options={{ headerShown: true, gestureEnabled: false }}
                  />

                  <Stack.Screen
                    name="(first-account)"
                    options={{
                      headerShown: false,
                      gestureEnabled: false,
                      animation: "fade",
                    }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false, gestureEnabled: false }}
                  />
                  <Stack.Screen
                    name="(tabs-nested)"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="(not-found)"
                    options={{ headerShown: false }}
                  />
                </Stack>
                <BaseBottomSheet />
                {/* <StatusBar style="auto" /> */}
              </SplashProvider>
            </GestureHandlerRootView>
          </PaperProvider>
        </SQLiteProvider>
      </BottomSheetProvider>
    </Suspense>
  );
}
