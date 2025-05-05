/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryColor = "#2F7E79";
const primaryDark = "#1B5C58";
const onPrimaryColor = "#FFFFFF";
const white = "#FFFFFF";
const black = "#000000";
const warnOrange = "#F4A261";
const softTeal = "#A0D3CE";

export const Colors = {
  primaryColor: primaryColor,
  primaryDark: primaryDark,
  onPrimaryColor: onPrimaryColor,
  white: white,
  black: black,
  orange: "#FFA500",
  yellow: "#FFFF00",
  incomeText: "#25A969",
  spentText: "#F95B51",
  warnOrange: "#F4A261",
  softTeal: "#A0D3CE",
  lightGrey: "#F5F5F5",
  gradient: ["#3F8782", "#69AEA9"] as const,
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    tabBar: "#E6F2F1",
    tabBarFocused: primaryColor,
    tabBarUnFocused: "#BFBFBF",
    onBackground: "#11181C",
    secondaryOnBackground: "#8A9197",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: primaryColor,
  },
  dark: {
    text: "#11181C",
    background: "#FFFFFF",
    tabBar: "#E6F2F1",
    tabBarFocused: primaryColor,
    tabBarUnFocused: "#BFBFBF",
    onBackground: "#11181C",
    secondaryOnBackground: "#8A9197",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: primaryColor,
  },
};
