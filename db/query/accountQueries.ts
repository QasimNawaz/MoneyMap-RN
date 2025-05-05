import { eq, sql } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  Account,
  accountsTable,
  AccountType,
  accountTypesTable,
  Transaction,
  transactionsTable,
} from "@/db/schema";

export const ALL_ACCOUNT: Account = {
  id: -1, // Use an ID that won't conflict with real accounts
  name: "ALL",
  accountNumber: "000000",
  amount: 0,
  exclude: false,
  archive: false,
  accountTypeId: -1,
};

export const hasAccounts = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<boolean> => {
  try {
    const accounts = await drizzleDb
      .select({ count: sql<number>`count(*)` })
      .from(accountsTable);
    return accounts[0].count > 0;
  } catch (error) {
    console.error("Error checking accounts:", error);
    throw error;
  }
};

// Fetch random account
export const fetchRandomAccount = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Account | null> => {
  try {
    const accounts = await drizzleDb
      .select()
      .from(accountsTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return accounts[0] || null;
  } catch (error) {
    console.error("Error fetching random account:", error);
    throw error;
  }
};

// Fetch account
export const fetchAccount = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Account> => {
  try {
    const accounts = await drizzleDb.select().from(accountsTable).limit(1);
    return accounts[0];
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

// Fetch all accounts
export const fetchAccounts = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<{ list: Account[]; totalAmount: number }> => {
  try {
    const list = await drizzleDb.select().from(accountsTable);

    const totalAmount = list.reduce((sum, account) => sum + account.amount, 0);

    return { list, totalAmount };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

// Fetch account by ID
export const fetchAccountById = async (
  accountId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Account | null> => {
  try {
    const accounts = await drizzleDb
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.id, accountId))
      .limit(1);

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

// Fetch account with account type
export const fetchAccountsWithAccountType = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<{
  accounts: (Account & { accountType: AccountType })[];
}> => {
  try {
    // Perform the JOIN query
    const results = await drizzleDb
      .select({
        // Account fields
        id: accountsTable.id,
        name: accountsTable.name,
        accountNumber: accountsTable.accountNumber,
        amount: accountsTable.amount,
        exclude: accountsTable.exclude,
        archive: accountsTable.archive,
        accountTypeId: accountsTable.accountTypeId,
        // Account type fields as nested object
        accountType: {
          id: accountTypesTable.id,
          name: accountTypesTable.name,
          iconName: accountTypesTable.iconName,
          iconFamily: accountTypesTable.iconFamily,
        },
      })
      .from(accountsTable)
      .innerJoin(
        accountTypesTable,
        eq(accountsTable.accountTypeId, accountTypesTable.id)
      );

    // Transform the results to match the expected type
    const accounts = results.map((result) => ({
      id: result.id,
      name: result.name,
      accountNumber: result.accountNumber,
      amount: result.amount,
      exclude: result.exclude,
      archive: result.archive,
      accountTypeId: result.accountTypeId,
      accountType: result.accountType,
    }));

    return { accounts };
  } catch (error) {
    console.error("Error fetching accounts with account type:", error);
    throw error;
  }
};

// Insert account
export const insertAccount = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  account: Omit<Account, "id">
): Promise<Account> => {
  try {
    const result = await drizzleDb
      .insert(accountsTable)
      .values({
        name: account.name,
        accountNumber: account.accountNumber,
        amount: account.amount,
        exclude: account.exclude,
        archive: account.archive,
        accountTypeId: account.accountTypeId,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error inserting account:", error);
    throw error;
  }
};

export const updateAccount = async (
  accountId: number,
  name: string,
  accountNumber: string,
  exclude: boolean,
  archive: boolean,
  accountTypeId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<void> => {
  try {
    await drizzleDb
      .update(accountsTable)
      .set({
        name,
        accountNumber,
        exclude,
        archive,
        accountTypeId,
      })
      .where(eq(accountsTable.id, accountId));

    console.log("Account updated successfully.");
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

export const deleteAccount = async (
  accountId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<void> => {
  try {
    await drizzleDb
      .delete(accountsTable)
      .where(eq(accountsTable.id, accountId));

    console.log("Account deleted successfully.");
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

export const fetchAccountBalances = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Map<number, number>> => {
  try {
    const accounts = await drizzleDb
      .select({
        id: accountsTable.id,
        amount: accountsTable.amount,
      })
      .from(accountsTable);

    // Convert array of accounts to Map<accountId, amount>
    const balanceMap = new Map(
      accounts.map((account) => [account.id, account.amount])
    );

    return balanceMap;
  } catch (error) {
    console.error("Error fetching account balances:", error);
    throw error;
  }
};
