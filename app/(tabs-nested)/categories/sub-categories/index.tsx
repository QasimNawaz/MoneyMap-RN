import { ThemedView } from "@/components/ThemedView";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import React, { useCallback, useEffect, useState } from "react";
import { fetchSubcategoriesByCategoryId } from "@/db/query/categoryQueries";
import { SubCategory } from "@/db/schema";
import { Colors } from "@/constants/Colors";
import { getIconComponent } from "@/assets/icons";
import { FAB } from "react-native-paper";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function SubCategoriesScreen() {
  const { id, name } = useLocalSearchParams();
  const { typedReplace, typedNavigate, back } = useTypedRouter();
  const { drizzleDb } = useDrizzleDatabase();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const categoryName = Array.isArray(name) ? name[0] : name;

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const data = await fetchSubcategoriesByCategoryId(
          Number(id),
          drizzleDb
        );
        // console.log("subCategory", data);
        setSubCategories(data);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  // useFocusEffect(() => {
  //   loadData();
  // }, [drizzleDb]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [drizzleDb])
  );

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
          title={categoryName || "Sub Category"}
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
            <Text style={styles.header}>SUBCATEGORIES</Text>
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          data={subCategories}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingBottom: 80,
          }}
          renderItem={({ item }) => (
            <View style={styles.categoryContainer}>
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => {
                  typedNavigate("(tabs-nested)/categories/edit-sub-category", {
                    categoryId: item.id,
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

        <FAB
          style={[
            styles.fab,
            {
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
          icon="plus"
          color="white"
          onPress={() => {
            // router.push({
            //   pathname: "/categories/add-sub-category",
            //   params: { categoryId: id },
            // });
            // router.push("/categories/add-sub-category");
            typedNavigate("(tabs-nested)/categories/add-sub-category", {
              categoryId: Number(id),
            });
          }}
        />
      </SafeAreaView>
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
  fab: {
    position: "absolute",
    right: 30,
    bottom: 60,
    backgroundColor: Colors.primaryColor,
  },
});
