import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { fetchAllCategories } from "@/db/query/categoryQueries";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import { getIconComponent } from "@/assets/icons";
import { Category } from "@/db/schema";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function EditCategoriesScreen() {
  const { drizzleDb } = useDrizzleDatabase();
  const { typedReplace, typedNavigate, back } = useTypedRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const data = await fetchAllCategories(drizzleDb);
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Toolbar
          leftIcon={
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color="black"
            />
          }
          title="Edit Categories"
          titleAlignment="left"
          theme="light"
          onActionPress={(action) => {
            switch (action) {
              case ToolbarAction.LEFT_ICON:
                back();
                break;
            }
          }}
        />
        <FlatList
          ListHeaderComponent={() => (
            <Text style={styles.header}>ALL CATEGORIES</Text>
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.categoryContainer}>
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => {
                  typedNavigate("(tabs-nested)/categories/sub-categories", {
                    id: item.id,
                    name: item.name,
                  });
                }}
                style={styles.categoryHeader}
              >
                {/* TabIcon with rounded background */}
                <View style={styles.iconContainer}>
                  {getIconComponent(
                    item.iconFamily ?? "FontAwesome",
                    item.iconName ?? "question"
                  )}
                </View>
                {/* Text container for title and description */}
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                </View>
                {/* Arrow icon */}
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="#000"
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
      <StatusBar style="dark" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  categoryContainer: {
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    fontSize: 20,
    paddingVertical: 15,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  categoryHeader: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
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
  arrowIcon: {
    marginLeft: 10,
  },
});
