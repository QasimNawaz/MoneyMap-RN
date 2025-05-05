import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { getIconComponent } from "@/assets/icons";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import IconPickerModal from "@/components/IconPickerModal";
import CategoryNameModal from "@/components/CategoryNameModal";
import CategoryNatureModal from "@/components/CategoryNatureModal";
import { addSubcategory } from "@/db/query/categoryQueries";
import { Colors } from "@/constants/Colors";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function AddSubCategoryScreen() {
  const { typedReplace, typedNavigate, back } = useTypedRouter();
  const { categoryId } = useLocalSearchParams();
  const { drizzleDb } = useDrizzleDatabase();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState({
    name: "",
    nature: "Must",
    iconName: "question",
    iconFamily: "FontAwesome",
  });
  const [isIconModalVisible, setIconModalVisible] = useState(false);
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isNatureModalVisible, setNatureModalVisible] = useState(false);

  const saveSubCategory = async () => {
    if (!subCategory.name.trim()) {
      setErrorMessage("Subcategory name is required.");
      return;
    }
    if (drizzleDb) {
      try {
        await addSubcategory(
          subCategory.name,
          subCategory.nature,
          subCategory.iconName,
          subCategory.iconFamily,
          Number(categoryId),
          drizzleDb
        );
        setErrorMessage(null);
        back(); // Go back to the previous screen after adding
      } catch (err) {
        console.error("Error adding subcategory:", err);
      }
    }
  };

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
          title="Add Subcategory"
          titleAlignment="left"
          theme="light"
          onActionPress={(action) => {
            if (action === ToolbarAction.LEFT_ICON) {
              back();
            }
          }}
        />

        {/* Icon Selection */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconContainer}>
            {getIconComponent(subCategory.iconFamily, subCategory.iconName, 50)}
          </View>
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={() => setIconModalVisible(true)}
          >
            <MaterialIcons name="edit" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Category Name */}
        <View style={[styles.infoContainer, { marginTop: 40 }]}>
          <Text style={styles.label}>Category Name</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{subCategory.name || "Enter Name"}</Text>
            <TouchableOpacity
              style={styles.smallEditIcon}
              onPress={() => {
                setErrorMessage(null);
                setNameModalVisible(true);
              }}
            >
              <MaterialIcons name="edit" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Nature */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Category Nature</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{subCategory.nature}</Text>
            <TouchableOpacity
              style={styles.smallEditIcon}
              onPress={() => setNatureModalVisible(true)}
            >
              <MaterialIcons name="edit" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {errorMessage && (
          <Text style={{ color: "red", marginTop: 10, alignSelf: "center" }}>
            {errorMessage}
          </Text>
        )}
        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSubCategory}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Icon Picker Modal */}
        <IconPickerModal
          visible={isIconModalVisible}
          onClose={() => setIconModalVisible(false)}
          onSelectIcon={(icon) => {
            setSubCategory({
              ...subCategory,
              iconName: icon.iconName,
              iconFamily: icon.familyName,
            });
            setIconModalVisible(false);
          }}
        />

        {/* Name Modal */}
        <CategoryNameModal
          visible={isNameModalVisible}
          onClose={() => setNameModalVisible(false)}
          onConfirm={(updatedName) =>
            setSubCategory({ ...subCategory, name: updatedName })
          }
          currentCategoryName={subCategory.name}
          title="Enter Category Name"
        />

        {/* Nature Modal */}
        <CategoryNatureModal
          visible={isNatureModalVisible}
          onClose={() => setNatureModalVisible(false)}
          onConfirm={(updatedNature) =>
            setSubCategory({ ...subCategory, nature: updatedNature })
          }
          defaultNature={subCategory.nature}
          title="Select Category Nature"
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
    borderRadius: 50,
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
    borderRadius: 16,
    backgroundColor: Colors.orange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
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
  saveButton: {
    backgroundColor: Colors.primaryColor,
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});
