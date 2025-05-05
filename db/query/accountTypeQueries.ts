import { eq } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as FileSystem from "expo-file-system";
import { DATABASE_NAME } from "../dbConfig";
import { AccountType, accountTypesTable } from "@/db/schema";

export const insertAccountTypesIfEmpty = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  accountTypes: { name: string; iconName: string; iconFamily: string }[]
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // await drizzleDb.delete(accountTypesTable);
    // Check if the account types table is empty
    const existingAccountTypes = await drizzleDb
      .select()
      .from(accountTypesTable);

    if (existingAccountTypes.length === 0) {
      // Insert account types if the table is empty
      const insertedAccountTypes = await drizzleDb
        .insert(accountTypesTable)
        .values(
          accountTypes.map((accountType) => ({
            name: accountType.name,
            iconName: accountType.iconName,
            iconFamily: accountType.iconFamily,
          }))
        )
        .returning();

      return {
        success: true,
        message: "Account types inserted successfully.",
        data: insertedAccountTypes,
      };
    } else {
      console.log("Account types table is not empty, skipping insert.");
      return {
        success: true,
        message: "Account types table is not empty. Skipping insert.",
      };
    }
  } catch (error) {
    console.error("Error inserting account types:", error);
    return {
      success: false,
      message: "Error inserting account types.",
      data: error instanceof Error ? error.message : error,
    };
  }
};

export const fetchAccountTypes = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<AccountType[]> => {
  try {
    const accountTypes = await drizzleDb.select().from(accountTypesTable);

    return accountTypes;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const fetchAccountTypeByName = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  name: string
): Promise<AccountType> => {
  try {
    const accountTypes = await drizzleDb
      .select()
      .from(accountTypesTable)
      .where(eq(accountTypesTable.name, name))
      .limit(1);

    return accountTypes[0];
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const accountTypesWithIcons = [
  {
    name: "General",
    iconName: "cogs",
    iconFamily: "FontAwesome",
  },
  {
    name: "Cash",
    iconName: "cash",
    iconFamily: "Ionicons",
  },
  {
    name: "Current account",
    iconName: "university",
    iconFamily: "FontAwesome",
  },
  {
    name: "Credit card",
    iconName: "credit-card",
    iconFamily: "FontAwesome",
  },
  {
    name: "Saving account",
    iconName: "piggy-bank",
    iconFamily: "FontAwesome5",
  },
  {
    name: "Bonus",
    iconName: "gift",
    iconFamily: "FontAwesome",
  },
  {
    name: "Insurance",
    iconName: "shield-alt",
    iconFamily: "FontAwesome5",
  },
  {
    name: "Investment",
    iconName: "chart-line",
    iconFamily: "FontAwesome5",
  },
  {
    name: "Loan",
    iconName: "hand-holding-usd",
    iconFamily: "FontAwesome5",
  },
  {
    name: "Mortgage",
    iconName: "home",
    iconFamily: "FontAwesome",
  },
  {
    name: "Account with overdraft",
    iconName: "credit-card",
    iconFamily: "FontAwesome",
  },
];
