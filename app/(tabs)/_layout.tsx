import { Tabs, useRouter, useNavigationContainerRef } from "expo-router";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import TabBar from "@/components/TabBar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const navigationRef = useNavigationContainerRef();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <Tabs
        tabBar={(props) => {
          if (props.state.routes[props.state.index].name === "add") {
            return null;
          }
          return <TabBar {...props} />;
        }}
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { position: "absolute" },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            href: null,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: "Statistics",
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: "Accounts",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
