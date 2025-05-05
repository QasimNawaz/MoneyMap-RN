import React from "react";
import { Text, View } from "react-native";
import { IconType } from "../assets/icons"; // Adjust path to your icons file

// Define the type for the settings items
export type SettingItem = {
  title: string;
  icon: IconType; // Use IconType to reference valid icons
  description: string;
  route: string; // Add route to navigate to
};

export type SettingsData = {
  title: string | undefined;
  items: SettingItem[];
};

// Your settings data with icon as IconType
export const settingsData: SettingsData[] = [
  {
    title: undefined,
    items: [
      {
        title: "User Profile",
        icon: "profile", // Example, matches with IconType
        description:
          "Change profile image, name or password, logout or delete data",
        route: "(tabs-nested)/profile",
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        title: "Categories",
        icon: "categories", // Example
        description:
          "Manage categories, change icons and add custom subcategories",
        route: "(tabs-nested)/categories",
      },
      {
        title: "Labels",
        icon: "labels", // Example
        description: "Define labels for better filtering",
        route: "(tabs-nested)/labels",
      },
      {
        title: "Templates",
        icon: "templates", // Example
        description: "Create templates to speed up the addition of new records",
        route: "(tabs-nested)/templates",
      },
    ],
  },
  {
    title: "Other settings",
    items: [
      {
        title: "Notifications",
        icon: "notifications", // Example
        description: "Configure notification you want to receive",
        route: "(tabs-nested)/notification",
      },
      {
        title: "About",
        icon: "about", // Example
        description: "Learn more about MoneyMap",
        route: "(tabs-nested)/about",
      },
    ],
  },
];
