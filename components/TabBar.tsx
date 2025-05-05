import { View, StyleSheet, useWindowDimensions } from "react-native";
import React from "react";
import TabBarButton from "./TabBarButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const TabBar = ({ state, descriptors, navigation }) => {
  const theme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  // Calculate button size based on screen width
  const buttonSize = Math.min(72, screenWidth * 0.18); // 18% of screen width, max 72px
  const bottomOffset = Math.min(40, screenWidth * 0.1); // 10% of screen width, max 40px

  const tabBarColor =
    theme === "dark" ? Colors.dark.tabBar : Colors.light.tabBar;
  const focusedTabBarColor =
    theme === "dark" ? Colors.dark.tabBarFocused : Colors.light.tabBarFocused;
  const unFocusedTabBarColor =
    theme === "dark"
      ? Colors.dark.tabBarUnFocused
      : Colors.light.tabBarUnFocused;
  const fabBorderColor =
    theme === "dark" ? Colors.dark.onBackground : Colors.light.onBackground;

  // If current route is add screen, don't render the tab bar
  // if (state.routes[state.index].name === "add") {
  //   return null;
  // }
  console.log("TabBar", state.routes[state.index].name);
  return (
    <View
      style={[
        styles.tabbar,
        {
          backgroundColor: tabBarColor,
          paddingHorizontal: Math.min(20, screenWidth * 0.05), // Responsive padding
        },
      ]}
    >
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };
        const isAddButton = route.name === "add";

        return (
          <TabBarButton
            key={route.name}
            style={[
              styles.tabbarItem,
              isAddButton && [
                styles.addButton,
                {
                  width: buttonSize,
                  height: buttonSize,
                  bottom: bottomOffset,
                  borderColor: fabBorderColor,
                },
              ],
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? focusedTabBarColor : unFocusedTabBarColor}
            label={label}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    borderRadius: 25,
    borderCurve: "continuous",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 20,
  },
  tabbarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addButton: {
    position: "sticky",
    bottom: 40,
    alignSelf: "center",
    height: 72,
    borderRadius: 50,
    backgroundColor: Colors.primaryColor,
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.3,
    elevation: 5,
    borderWidth: 1,
  },
});

export default TabBar;
