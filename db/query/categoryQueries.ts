import { eq, sql } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  Category,
  SubCategory,
  categoriesTable,
  subCategoriesTable,
} from "@/db/schema";

export const fetchRandomSubcategoryWithCategory = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<SubCategoryWithCategory | null> => {
  try {
    // First fetch the subcategory
    const subcategory = await drizzleDb
      .select()
      .from(subCategoriesTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (!subcategory[0]) {
      return null;
    }

    // Then fetch the parent category
    const category = await drizzleDb
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, subcategory[0].categoryId))
      .limit(1);

    if (!category[0]) {
      return null;
    }

    // Combine the results
    return {
      ...subcategory[0],
      category: category[0],
    };
  } catch (error) {
    console.error("Error fetching subcategory with category:", error);
    throw error;
  }
};

export const initializeDefaultCategoriesIfEmpty = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  categoriesWithIcons: CategoryEntry[],
  subCategoriesWithIcons: SubCategoryEntry[]
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // await drizzleDb.delete(categoriesTable);
    // await drizzleDb.delete(subCategoriesTable);
    const categoryRows = await drizzleDb.select().from(categoriesTable);
    const subCategoryRows = await drizzleDb.select().from(subCategoriesTable);

    if (categoryRows.length === 0 && subCategoryRows.length === 0) {
      // Insert categories if the table is empty
      const categoryResult = await drizzleDb
        .insert(categoriesTable)
        .values(
          categoriesWithIcons.map((category: CategoryEntry) => ({
            name: category.name,
            iconName: category.iconName,
            iconFamily: category.iconFamily,
            nature: category.nature,
          }))
        )
        .returning();

      const categoryMap = categoryResult.reduce((acc, category) => {
        acc[category.name] = category.id;
        return acc;
      }, {} as Record<string, number>);

      // Insert subcategories with category ids
      const subCategoryResult = await drizzleDb
        .insert(subCategoriesTable)
        .values(
          subCategoriesWithIcons.map((subCategory) => {
            const categoryId = categoryMap[subCategory.category];

            if (!categoryId) {
              throw new Error(
                `Category ${subCategory.name} not found for subcategory ${subCategory.name}`
              );
            }

            return {
              name: subCategory.name,
              iconName: subCategory.iconName,
              iconFamily: subCategory.iconFamily,
              nature: subCategory.nature,
              categoryId: categoryId, // Linking subcategory to the category
            };
          })
        )
        .returning();

      return {
        success: true,
        message: "Categories and subcategories inserted successfully.",
        data: {
          categories: categoryResult,
          subCategories: subCategoryResult,
        },
      };
    } else {
      console.log("Tables are not empty, skipping insert.");
      return {
        success: true,
        message: "Tables are not empty. Skipping insert.",
      };
    }
  } catch (error) {
    console.error("Error inserting categories and subcategories:", error);
    return {
      success: false,
      message: "Error inserting categories and subcategories.",
      data: error instanceof Error ? error.message : error,
    };
  }
};

export const fetchAllCategories = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Category[]> => {
  try {
    const categories = await drizzleDb.select().from(categoriesTable);

    return categories;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw error;
  }
};

export const fetchSubcategoriesByCategoryId = async (
  categoryId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<SubCategory[]> => {
  try {
    const subcategories = await drizzleDb
      .select()
      .from(subCategoriesTable)
      .where(eq(subCategoriesTable.categoryId, categoryId));
    return subcategories;
  } catch (error) {
    console.error("Error fetching subcategories by category id:", error);
    throw error;
  }
};

export const addSubcategory = async (
  name: string,
  nature: string,
  iconName: string,
  iconFamily: string,
  categoryId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<SubCategory | null> => {
  try {
    const insertedSubcategories = await drizzleDb
      .insert(subCategoriesTable)
      .values({
        name,
        nature,
        iconName,
        iconFamily,
        categoryId,
      })
      .returning();
    const newSubcategory = insertedSubcategories[0] ?? null;
    console.log("Subcategory added successfully:", newSubcategory);
    return newSubcategory;
  } catch (error) {
    console.error("Error adding subcategory:", error);
    throw error;
  }
};

export const fetchSubcategoryById = async (
  subCategoryId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<SubCategory | null> => {
  try {
    const subcategories = await drizzleDb
      .select()
      .from(subCategoriesTable)
      .where(eq(subCategoriesTable.id, subCategoryId))
      .limit(1);
    return subcategories[0] || null;
  } catch (error) {
    console.error("Error fetching subcategories by Subcategory id:", error);
    throw error;
  }
};

export const updateSubcategoryIcon = async (
  subcategoryId: number,
  iconName: string,
  iconFamily: string,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<void> => {
  try {
    await drizzleDb
      .update(subCategoriesTable)
      .set({
        iconName,
        iconFamily,
      })
      .where(eq(subCategoriesTable.id, subcategoryId));

    console.log("Subcategory icon updated successfully.");
  } catch (error) {
    console.error("Error updating subcategory icon:", error);
    throw error;
  }
};

export const updateSubcategoryName = async (
  subcategoryId: number,
  name: string,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<void> => {
  try {
    await drizzleDb
      .update(subCategoriesTable)
      .set({
        name,
      })
      .where(eq(subCategoriesTable.id, subcategoryId));

    console.log("Subcategory name updated successfully.");
  } catch (error) {
    console.error("Error updating subcategory name:", error);
    throw error;
  }
};

export const updateSubcategoryNature = async (
  subcategoryId: number,
  nature: string,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
) => {
  try {
    await drizzleDb
      .update(subCategoriesTable)
      .set({ nature })
      .where(eq(subCategoriesTable.id, subcategoryId));
    console.log("Subcategory nature updated successfully.");
  } catch (error) {
    console.error("Error updating subcategory nature:", error);
    throw error;
  }
};

export const fetchCategoriesWithSubcategories = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<CategoryWithSubcategories[]> => {
  try {
    // Get all categories
    const categories = await drizzleDb.select().from(categoriesTable);
    // Get all subcategories
    const subCategories = await drizzleDb.select().from(subCategoriesTable);
    // Map subcategories under respective categories
    const categoryData: CategoryWithSubcategories[] = categories.map(
      (category: Category) => ({
        id: category.id,
        name: category.name,
        iconName: category.iconName,
        iconFamily: category.iconFamily,
        nature: category.nature,
        subcategories: subCategories.filter(
          (sub) => sub.categoryId === category.id
        ),
        expanded: false,
      })
    );

    return categoryData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const fetchSubcategoryWithCategory = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<SubCategoryWithCategory | null> => {
  try {
    // First fetch the subcategory
    const subcategory = await drizzleDb
      .select()
      .from(subCategoriesTable)
      .limit(1);

    if (!subcategory[0]) {
      return null;
    }

    // Then fetch the parent category
    const category = await drizzleDb
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, subcategory[0].categoryId))
      .limit(1);

    if (!category[0]) {
      return null;
    }

    // Combine the results
    return {
      ...subcategory[0],
      category: category[0],
    };
  } catch (error) {
    console.error("Error fetching subcategory with category:", error);
    throw error;
  }
};

export type CategoryWithSubcategories = {
  id: number;
  name: string;
  iconName: string | null;
  iconFamily: string | null;
  nature: string;
  subcategories: SubCategory[];
  expanded: boolean;
};

export type CategoryEntry = {
  name: string;
  iconFamily: string;
  iconName: string;
  nature: string;
};

export type SubCategoryEntry = {
  name: string;
  iconFamily: string;
  iconName: string;
  category: string;
  nature: string;
};

export interface SubCategoryWithCategory extends SubCategory {
  category: Category;
}

export const categoriesWithIcons: CategoryEntry[] = [
  {
    name: "Food & Drinks",
    iconFamily: "MaterialIcons",
    iconName: "local-bar",
    nature: "Must",
  },
  {
    name: "Shopping",
    iconFamily: "FontAwesome",
    iconName: "shopping-cart",
    nature: "Want",
  },
  {
    name: "Housing",
    iconFamily: "MaterialIcons",
    iconName: "home",
    nature: "Must",
  },
  {
    name: "Transportation",
    iconFamily: "FontAwesome",
    iconName: "car",
    nature: "Must",
  },
  {
    name: "Vehicle",
    iconFamily: "FontAwesome5",
    iconName: "gas-pump",
    nature: "Want",
  },
  {
    name: "Life & Entertainment",
    iconFamily: "FontAwesome",
    iconName: "dumbbell",
    nature: "Want",
  },
  {
    name: "Communication, PC",
    iconFamily: "FontAwesome",
    iconName: "wifi",
    nature: "Want",
  },
  {
    name: "Financial Expenses",
    iconFamily: "MaterialIcons",
    iconName: "receipt",
    nature: "Want",
  },
  {
    name: "Investments",
    iconFamily: "FontAwesome",
    iconName: "chart-line",
    nature: "Want",
  },
  {
    name: "Income",
    iconFamily: "FontAwesome",
    iconName: "ticket",
    nature: "Must",
  },
  {
    name: "Other",
    iconFamily: "FontAwesome",
    iconName: "miscellaneous",
    nature: "Want",
  },
];

export const subCategoriesWithIcons: SubCategoryEntry[] = [
  // Food & Drinks
  {
    name: "Bar, Cafe",
    iconFamily: "MaterialIcons",
    iconName: "local-bar",
    category: "Food & Drinks",
    nature: "Want",
  },
  {
    name: "Groceries",
    iconFamily: "FontAwesome",
    iconName: "shopping-cart",
    category: "Food & Drinks",
    nature: "Must",
  },
  {
    name: "Restaurant, Fast-Food",
    iconFamily: "MaterialIcons",
    iconName: "restaurant",
    category: "Food & Drinks",
    nature: "Need",
  },
  {
    name: "Meal Delivery Services",
    iconFamily: "FontAwesome",
    iconName: "motorcycle",
    category: "Food & Drinks",
    nature: "Need",
  },

  // Shopping
  {
    name: "Clothes & Shoes",
    iconFamily: "FontAwesome",
    iconName: "tshirt",
    category: "Shopping",
    nature: "Need",
  },
  {
    name: "Drug-store, Chemist",
    iconFamily: "MaterialIcons",
    iconName: "local-pharmacy",
    category: "Shopping",
    nature: "Must",
  },
  {
    name: "Electronics, Accessories",
    iconFamily: "MaterialIcons",
    iconName: "devices-other",
    category: "Shopping",
    nature: "Need",
  },
  {
    name: "Free time",
    iconFamily: "MaterialIcons",
    iconName: "beach-access",
    category: "Shopping",
    nature: "Want",
  },
  {
    name: "Gifts, Joy",
    iconFamily: "FontAwesome",
    iconName: "gift",
    category: "Shopping",
    nature: "Want",
  },
  {
    name: "Health & Beauty",
    iconFamily: "MaterialIcons",
    iconName: "spa",
    category: "Shopping",
    nature: "Need",
  },
  {
    name: "Home, Garden",
    iconFamily: "MaterialIcons",
    iconName: "home",
    category: "Shopping",
    nature: "Need",
  },
  {
    name: "Jewels, Accessories",
    iconFamily: "FontAwesome",
    iconName: "diamond",
    category: "Shopping",
    nature: "Want",
  },
  {
    name: "Kids",
    iconFamily: "FontAwesome",
    iconName: "child",
    category: "Shopping",
    nature: "Must",
  },
  {
    name: "Pets, Animals",
    iconFamily: "FontAwesome",
    iconName: "paw",
    category: "Shopping",
    nature: "Need",
  },
  {
    name: "Stationary, Tools",
    iconFamily: "Feather",
    iconName: "edit",
    category: "Shopping",
    nature: "Need",
  },
  {
    name: "Luxury Goods",
    iconFamily: "MaterialIcons",
    iconName: "luxury",
    category: "Shopping",
    nature: "Want",
  },

  // Housing
  {
    name: "Energy, Utilities",
    iconFamily: "FontAwesome",
    iconName: "bolt",
    category: "Housing",
    nature: "Must",
  },
  {
    name: "Maintenance, Repairs",
    iconFamily: "MaterialIcons",
    iconName: "build",
    category: "Housing",
    nature: "Must",
  },
  {
    name: "Mortgage",
    iconFamily: "FontAwesome5",
    iconName: "money-check-alt",
    category: "Housing",
    nature: "Must",
  },
  {
    name: "Property, Insurance",
    iconFamily: "FontAwesome5",
    iconName: "shield-alt",
    category: "Housing",
    nature: "Must",
  },
  {
    name: "Rent",
    iconFamily: "MaterialIcons",
    iconName: "home",
    category: "Housing",
    nature: "Must",
  },
  {
    name: "Services",
    iconFamily: "MaterialIcons",
    iconName: "settings",
    category: "Housing",
    nature: "Need",
  },
  {
    name: "Home Security Systems",
    iconFamily: "MaterialIcons",
    iconName: "security",
    category: "Housing",
    nature: "Need",
  },
  {
    name: "Home Renovations",
    iconFamily: "MaterialIcons",
    iconName: "construction",
    category: "Housing",
    nature: "Want",
  },

  // Transportation
  {
    name: "Business trips",
    iconFamily: "FontAwesome",
    iconName: "briefcase",
    category: "Transportation",
    nature: "Need",
  },
  {
    name: "Long Distance",
    iconFamily: "FontAwesome",
    iconName: "road",
    category: "Transportation",
    nature: "Need",
  },
  {
    name: "Public transport",
    iconFamily: "FontAwesome",
    iconName: "bus",
    category: "Transportation",
    nature: "Must",
  },
  {
    name: "Taxi",
    iconFamily: "FontAwesome",
    iconName: "taxi",
    category: "Transportation",
    nature: "Need",
  },
  {
    name: "Ride-sharing Apps",
    iconFamily: "FontAwesome",
    iconName: "car",
    category: "Transportation",
    nature: "Need",
  },

  // Vehicle
  {
    name: "Fuel",
    iconFamily: "FontAwesome5",
    iconName: "gas-pump",
    category: "Vehicle",
    nature: "Must",
  },
  {
    name: "Leasing",
    iconFamily: "FontAwesome5",
    iconName: "car-side",
    category: "Vehicle",
    nature: "Need",
  },
  {
    name: "Parking",
    iconFamily: "FontAwesome",
    iconName: "parking",
    category: "Vehicle",
    nature: "Need",
  },
  {
    name: "Rentals",
    iconFamily: "MaterialIcons",
    iconName: "car-rental",
    category: "Vehicle",
    nature: "Need",
  },
  {
    name: "Vehicle Insurance",
    iconFamily: "MaterialCommunityIcons",
    iconName: "shield-car",
    category: "Vehicle",
    nature: "Must",
  },
  {
    name: "Vehicle Maintenance",
    iconFamily: "FontAwesome",
    iconName: "wrench",
    category: "Vehicle",
    nature: "Must",
  },
  {
    name: "Vehicle Accessories",
    iconFamily: "FontAwesome5",
    iconName: "toolbox",
    category: "Vehicle",
    nature: "Want",
  },

  // Life & Entertainment
  {
    name: "Active Sport, Fitness",
    iconFamily: "FontAwesome",
    iconName: "dumbbell",
    category: "Life & Entertainment",
    nature: "Need",
  },
  {
    name: "Alcohol, Tobacco",
    iconFamily: "FontAwesome",
    iconName: "wine-bottle",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "Books, Audio, Subscription",
    iconFamily: "FontAwesome",
    iconName: "book",
    category: "Life & Entertainment",
    nature: "Need",
  },
  {
    name: "Charity, Gifts",
    iconFamily: "FontAwesome",
    iconName: "donate",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "Culture, Sport Events",
    iconFamily: "FontAwesome",
    iconName: "theater-masks",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "Education, Development",
    iconFamily: "MaterialIcons",
    iconName: "school",
    category: "Life & Entertainment",
    nature: "Need",
  },
  {
    name: "Health Care, Doctor",
    iconFamily: "FontAwesome",
    iconName: "hospital",
    category: "Life & Entertainment",
    nature: "Must",
  },
  {
    name: "Hobbies",
    iconFamily: "FontAwesome",
    iconName: "palette",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "Holiday, Trips, Hotels",
    iconFamily: "FontAwesome5",
    iconName: "suitcase-rolling",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "Life Events",
    iconFamily: "FontAwesome",
    iconName: "birthday-cake",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "Lottery, Gambling",
    iconFamily: "FontAwesome",
    iconName: "dice",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "TV, Streaming",
    iconFamily: "FontAwesome",
    iconName: "tv",
    category: "Life & Entertainment",
    nature: "Want",
  },
  {
    name: "Wellness, Beauty",
    iconFamily: "FontAwesome",
    iconName: "heartbeat",
    category: "Life & Entertainment",
    nature: "Need",
  },
  {
    name: "Social Events & Parties",
    iconFamily: "FontAwesome",
    iconName: "users",
    category: "Life & Entertainment",
    nature: "Want",
  },

  // Communication, PC
  {
    name: "Internet",
    iconFamily: "FontAwesome",
    iconName: "wifi",
    category: "Communication, PC",
    nature: "Must",
  },
  {
    name: "Phone, Cell Phone",
    iconFamily: "FontAwesome",
    iconName: "phone",
    category: "Communication, PC",
    nature: "Must",
  },
  {
    name: "Postal Services",
    iconFamily: "Ionicons",
    iconName: "mail",
    category: "Communication, PC",
    nature: "Need",
  },
  {
    name: "Software, Apps, Games",
    iconFamily: "Ionicons",
    iconName: "game-controller",
    category: "Communication, PC",
    nature: "Need",
  },
  {
    name: "Cloud Services & Storage",
    iconFamily: "FontAwesome",
    iconName: "cloud",
    category: "Communication, PC",
    nature: "Need",
  },

  // Financial Expenses
  {
    name: "Banking, Loans",
    iconFamily: "FontAwesome",
    iconName: "bank",
    category: "Financial Expenses",
    nature: "Want",
  },
  {
    name: "Credit Cards",
    iconFamily: "MaterialIcons",
    iconName: "credit-card",
    category: "Financial Expenses",
    nature: "Want",
  },
  {
    name: "Debt",
    iconFamily: "FontAwesome",
    iconName: "exclamation-circle",
    category: "Financial Expenses",
    nature: "Want",
  },
  {
    name: "Insurance",
    iconFamily: "FontAwesome",
    iconName: "shield",
    category: "Financial Expenses",
    nature: "Need",
  },
  {
    name: "Loans, Mortgages",
    iconFamily: "MaterialIcons",
    iconName: "attach-money",
    category: "Financial Expenses",
    nature: "Want",
  },

  // Investments
  {
    name: "Crypto",
    iconFamily: "FontAwesome",
    iconName: "bitcoin",
    category: "Investments",
    nature: "Want",
  },
  {
    name: "Stocks, Bonds",
    iconFamily: "FontAwesome",
    iconName: "chart-line",
    category: "Investments",
    nature: "Want",
  },
  {
    name: "Real Estate",
    iconFamily: "MaterialIcons",
    iconName: "home",
    category: "Investments",
    nature: "Want",
  },

  // Income
  {
    name: "Salary",
    iconFamily: "MaterialIcons",
    iconName: "attach-money",
    category: "Income",
    nature: "Must",
  },
  {
    name: "Other",
    iconFamily: "FontAwesome",
    iconName: "money",
    category: "Income",
    nature: "Want",
  },
];
