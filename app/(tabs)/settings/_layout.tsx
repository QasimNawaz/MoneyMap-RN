import {
  Text,
  Image,
  StyleSheet,
  Platform,
  View,
  ImageBackground,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import {
  SettingItem,
  SettingsData,
  settingsData,
} from "@/constants/settingsData";
import TabIcon from "@/components/TabIcon";
import Toolbar from "@/components/Toolbar";
import { useTypedRouter } from "@/hooks/useTypedRouter";
import { AppRoutes } from "@/types/navigation";
import { StatusBar } from "expo-status-bar";

export default function SettingsScreen() {
  const screenHeight = Dimensions.get("window").height;
  const { typedReplace, typedNavigate, back } = useTypedRouter();
  return (
    <ThemedView style={styles.container}>
      {/* Image Background */}
      <ImageBackground
        source={require("@assets/images/home-bg.png")}
        style={[styles.imageBackground, { height: screenHeight * 0.25 }]}
        resizeMode="stretch"
      >
        <SafeAreaView style={styles.overlay}>
          {/* Toolbar */}
          <Toolbar
            rightIcon={
              <MaterialIcons name="notifications" size={24} color="white" />
            }
            theme="dark"
            onActionPress={(action) => {}}
          />
        </SafeAreaView>
      </ImageBackground>
      <View style={styles.mainContent}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: 140, paddingTop: 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {settingsData.map((section: SettingsData, index) => (
            <View key={index}>
              {section.title && (
                <Text style={styles.sectionTitle}>{section.title} </Text>
              )}
              {section.items.map((item: SettingItem, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.categoryContainer}
                    onPress={() => {
                      // router.push(`${item.route}` as Href)
                      typedNavigate(item.route as keyof AppRoutes);
                    }}
                  >
                    {/* TabIcon with rounded background */}
                    <View style={styles.iconContainer}>
                      <TabIcon route={item.icon} color="#fff" />
                    </View>

                    {/* Text container for title and description */}
                    <View style={styles.textContainer}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                    </View>

                    {/* Arrow icon */}
                    <MaterialIcons
                      name="arrow-forward"
                      size={24}
                      color="#000"
                      style={styles.arrowIcon}
                    />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>Qasim Nawaz</Text>
          <Image
            source={require("@assets/images/profile-avatar.png")}
            style={styles.userImage}
          />
        </View>
      </View>
      <StatusBar style="light" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    width: "100%",
  },
  mainContent: {
    flex: 1,
  },
  userInfoContainer: {
    position: "absolute",
    top: -130, // Adjust this value to position the widget correctly
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 16,
  },
  overlay: {
    flex: 1,
  },
  bellIcon: {
    color: Colors.white,
  },
  userName: {
    alignSelf: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginTop: 10,
  },
  userImage: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 10,
  },
  scrollContainer: {
    position: "sticky",
  },
  sectionTitle: {
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    fontSize: 20,
    textTransform: "uppercase",
    paddingVertical: 15,
    fontWeight: "bold",
  },
  categoryContainer: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: "#555",
  },
  arrowIcon: {
    marginLeft: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitleContainer: {
    marginLeft: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryDescription: {
    fontSize: 14,
    color: "gray",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemDetails: {
    marginLeft: 10,
  },
});
