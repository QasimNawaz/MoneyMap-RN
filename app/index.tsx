import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useSplashContext } from "@/context/SplashProvider";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import {
  categoriesWithIcons,
  initializeDefaultCategoriesIfEmpty,
  subCategoriesWithIcons,
} from "@/db/query/categoryQueries";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import {
  accountTypesWithIcons,
  insertAccountTypesIfEmpty,
} from "@/db/query/accountTypeQueries";
import { hasAccounts } from "@/db/query/accountQueries";
import { seedDummyTransactions } from "@/db/query/transactionQueries";
import { useTypedRouter } from "@/hooks/useTypedRouter";
import { AppRoutes } from "@/types/navigation";

export default function Splash() {
  const { splashLoading, isOnBoarded } = useSplashContext();
  const { loading: dbLoading, initialized, drizzleDb } = useDrizzleDatabase();
  const [appReady, setAppReady] = useState(false);
  const [hasExistingAccounts, setHasExistingAccounts] = useState(false);
  const { typedReplace } = useTypedRouter();

  useEffect(() => {
    async function prepareApp() {
      try {
        await SplashScreen.preventAutoHideAsync();

        // Ensure the database is initialized before inserting data
        if (!splashLoading && !dbLoading && initialized && drizzleDb) {
          await initializeDefaultCategoriesIfEmpty(
            drizzleDb,
            categoriesWithIcons,
            subCategoriesWithIcons
          );

          await insertAccountTypesIfEmpty(drizzleDb, accountTypesWithIcons);

          const accountsExist = await hasAccounts(drizzleDb);
          setHasExistingAccounts(accountsExist);
          await seedDummyTransactions(drizzleDb);

          setAppReady(true);
        }
      } catch (e) {
        console.error("Error during splash screen preparation:", e);
      }
    }

    prepareApp();
  }, [splashLoading, dbLoading, initialized, drizzleDb]);

  useEffect(() => {
    if (appReady) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [appReady]);

  useEffect(() => {
    const handleNavigation = async () => {
      if (!appReady) return;

      try {
        if (!isOnBoarded) {
          await typedReplace("(onboarding)");
          return;
        }

        if (!hasExistingAccounts) {
          await typedReplace("(first-account)");
          return;
        }

        await typedReplace("(tabs)");
      } catch (error) {
        console.error("Navigation error:", error);
      }
    };

    handleNavigation();
  }, [appReady, isOnBoarded, hasExistingAccounts]);

  if (!appReady) {
    return (
      <ThemedView style={styles.container}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
        />
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  logo: {
    width: 200, // Adjust the size of your logo
    height: 200,
    resizeMode: "contain",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#888888",
  },
});
