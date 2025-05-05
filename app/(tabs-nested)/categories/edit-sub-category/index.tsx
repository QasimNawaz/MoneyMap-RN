import { ThemedView } from "@/components/ThemedView";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import React, { useEffect, useState } from "react";
import {
  fetchSubcategoryById,
  updateSubcategoryIcon,
  updateSubcategoryName,
  updateSubcategoryNature,
} from "@/db/query/categoryQueries";
import { SubCategory } from "@/db/schema";
import { Colors } from "@/constants/Colors";
import { getIconComponent } from "@/assets/icons";
import IconPickerModal, { IconItem } from "@/components/IconPickerModal";
import CategoryNameModal from "@/components/CategoryNameModal";
import CategoryNatureModal from "@/components/CategoryNatureModal";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function EditSubCategoryScreen() {
  const { categoryId, name } = useLocalSearchParams();
  const { drizzleDb } = useDrizzleDatabase();
  const { typedReplace, typedNavigate, back } = useTypedRouter();
  const [subCategory, setSubCategory] = useState<SubCategory | null>();
  const [isIconModalVisible, setIconModalVisible] = useState(false);
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isNatureModalVisible, setNatureModalVisible] = useState(false);
  const categoryName = Array.isArray(name) ? name[0] : name;

  const loadData = async () => {
    if (drizzleDb) {
      try {
        console.log("EditSubCategory", Number(categoryId), name);
        const data = await fetchSubcategoryById(Number(categoryId), drizzleDb);
        console.log("EditSubCategory", data);
        setSubCategory(data);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  const updateIcon = async (icon: IconItem) => {
    if (subCategory && drizzleDb) {
      try {
        await updateSubcategoryIcon(
          subCategory.id,
          icon.iconName,
          icon.familyName,
          drizzleDb
        );
        setSubCategory({
          ...subCategory,
          iconName: icon.iconName,
          iconFamily: icon.familyName,
        });
        setIconModalVisible(false);
      } catch (err) {
        console.error("Error updating icon:", err);
      }
    }
  };

  const updateName = async (updatedName: string) => {
    if (subCategory && drizzleDb) {
      try {
        await updateSubcategoryName(subCategory.id, updatedName, drizzleDb);
        setSubCategory({
          ...subCategory,
          name: updatedName,
        });
        setNameModalVisible(false);
      } catch (err) {
        console.error("Error updating name:", err);
      }
    }
  };

  const updateNature = async (updatedNature: string) => {
    if (subCategory && drizzleDb) {
      try {
        await updateSubcategoryNature(subCategory.id, updatedNature, drizzleDb);
        setSubCategory({
          ...subCategory,
          nature: updatedNature,
        });
        setNatureModalVisible(false);
      } catch (err) {
        console.error("Error updating name:", err);
      }
    }
  };

  if (!subCategory) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Category Details
        </Text>
        <Text style={{ fontSize: 18, marginTop: 10 }}>ID: {categoryId}</Text>
        <Text style={{ fontSize: 18 }}>Name: {name}</Text>
      </View>
    );
  }
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
          // title={`Edit ${categoryName}` || "Edit"}
          title="Edit"
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
        <View style={styles.iconWrapper}>
          {/* Main Circular Container */}
          <View style={styles.iconContainer}>
            {getIconComponent(
              subCategory.iconFamily ?? "FontAwesome",
              subCategory.iconName ?? "question",
              50
            )}
          </View>

          {/* Edit Icon */}
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={() => {
              setIconModalVisible(true);
            }}
          >
            <MaterialIcons name="edit" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Category Name Field */}
        <View style={[styles.infoContainer, { marginTop: 40 }]}>
          <Text style={styles.label}>Category Name</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{subCategory.name}</Text>
            <TouchableOpacity
              style={styles.smallEditIcon}
              onPress={() => {
                setNameModalVisible(true);
              }}
            >
              <MaterialIcons name="edit" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Nature Field */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Category Nature</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{subCategory.nature}</Text>
            <TouchableOpacity
              style={styles.smallEditIcon}
              onPress={() => {
                setNatureModalVisible(true);
              }}
            >
              <MaterialIcons name="edit" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Icon Picker Modal */}
        <IconPickerModal
          visible={isIconModalVisible}
          onClose={() => setIconModalVisible(false)}
          onSelectIcon={(icon) => updateIcon(icon)}
        />
        {/* Name Modal */}
        <CategoryNameModal
          visible={isNameModalVisible}
          onClose={() => setNameModalVisible(false)}
          onConfirm={(updatedName) => updateName(updatedName)}
          currentCategoryName={categoryName}
          title="Edit Category Name"
        />

        {/* Nature Modal */}
        <CategoryNatureModal
          visible={isNatureModalVisible}
          onClose={() => setNatureModalVisible(false)}
          onConfirm={(updatedNature) => updateNature(updatedNature)}
          defaultNature={subCategory.nature}
          title="Edit Category Nature"
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconWrapper: {
    position: "relative",
    alignSelf: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50, // Half of width/height for a perfect circle
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16, // Half of width/height for a perfect circle
    backgroundColor: Colors.orange, // Customize color
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white", // Optional border to separate from background
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    fontSize: 16,
    paddingVertical: 15,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  smallEditIcon: {
    padding: 5,
  },
});
