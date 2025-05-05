// storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants";

// Save onboarding status
export const setOnboardingDone = async (value) => {
  console.log(`setOnboardingDone: ${value}`);
  await AsyncStorage.setItem(
    STORAGE_KEYS.ONBOARDING_DONE,
    JSON.stringify(value)
  );
};

// Check if onboarding is done
export const isOnboardingDone = async () => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
  return value ? JSON.parse(value) : false;
};

// Save user login status
export const setUserLoggedIn = async (value) => {
  console.log(`setUserLoggedIn: ${value}`);
  await AsyncStorage.setItem(
    STORAGE_KEYS.USER_LOGGED_IN,
    JSON.stringify(value)
  );
};

// Check if user is logged in
export const isUserLoggedIn = async () => {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOGGED_IN);
  return value ? JSON.parse(value) : false;
};
