import { theme } from "@/constants/theme";
import {
  CategoryWithSubcategories,
  fetchCategoriesWithSubcategories,
  SubCategoryWithCategory,
} from "@/db/query/categoryQueries";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { getIconComponent } from "@/assets/icons";
import { List } from "react-native-paper";

interface SelectCategoryScreenProps {
  isVisible: boolean;
  onClose: () => void;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
  setSubCategoryWithCategory: (
    subCategoryWithCategory: SubCategoryWithCategory
  ) => void;
}

export const SelectCategoryScreen: React.FC<SelectCategoryScreenProps> = ({
  isVisible,
  onClose,
  scaleAnim,
  opacityAnim,
  setSubCategoryWithCategory,
}) => {
  if (!isVisible) return null;
  const { drizzleDb } = useDrizzleDatabase();
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const data = await fetchCategoriesWithSubcategories(drizzleDb);
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  // Toggle expand/collapse
  const toggleExpand = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  // const [expanded, setExpanded] = useState(true);

  // const handlePress = () => setExpanded(!expanded);

  return (
    <Animated.View
      style={[
        styles.categoryScreenOverlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.categoryScreen,
          {
            transform: [{ scaleY: scaleAnim }],
          },
        ]}
      >
        <View style={styles.categoryScreenHeader}>
          <Text style={styles.categoryScreenTitle}>Select Category</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }}>
          <List.Section style={{ paddingHorizontal: 16 }}>
            {categories.map((category) => (
              <List.Accordion
                key={category.id}
                title={category.name}
                left={(props) => (
                  <View style={styles.iconContainer}>
                    {getIconComponent(category.iconFamily, category.iconName)}
                  </View>
                )}
                expanded={category.expanded}
                onPress={() => toggleExpand(category.id)}
              >
                {category.subcategories.map((subcategory) => (
                  <List.Item
                    key={subcategory.id}
                    title={subcategory.name}
                    left={(props) => (
                      <View style={styles.subCatIconContainer}>
                        {getIconComponent(
                          subcategory.iconFamily,
                          subcategory.iconName
                        )}
                      </View>
                    )}
                    onPress={() => {
                      setSubCategoryWithCategory({ ...subcategory, category });
                      onClose();
                    }}
                  />
                ))}
              </List.Accordion>
            ))}
          </List.Section>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  categoryScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryScreen: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "column",
  },
  categoryScreenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 16,
    // paddingTop: 40,
    padding: 16,
  },
  categoryScreenTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  categoryContainer: {
    marginVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
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
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  subCatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: theme.colors.softTeal,
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
  categoryTitle: {
    fontSize: 18,
    color: "white",
  },
  subcategory: {
    // padding: 12,
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderColor: "#ccc",

    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  subcategoryTitle: {
    fontSize: 16,
  },
});
