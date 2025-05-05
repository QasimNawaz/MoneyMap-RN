import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";
import { TABLES } from "./dbConfig";
import { TransactionType } from "../types/enums";

// Account Type table
export const accountTypesTable = sqliteTable(TABLES.ACCOUNT_TYPE, {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  iconName: text("iconName"),
  iconFamily: text("iconFamily"),
});

// Accounts table
export const accountsTable = sqliteTable(TABLES.ACCOUNTS, {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  accountNumber: text("account_number").notNull().unique(),
  amount: real("amount").notNull(),
  exclude: integer("exclude", { mode: "boolean" }).notNull().default(false),
  archive: integer("archive", { mode: "boolean" }).notNull().default(false),
  accountTypeId: integer("account_type_id")
    .notNull()
    .references(() => accountTypesTable.id, { onDelete: "cascade" }),
});

// Categories table
export const categoriesTable = sqliteTable(TABLES.CATEGORIES, {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  iconName: text("iconName"),
  iconFamily: text("iconFamily"),
  nature: text("nature").notNull(),
});

// SubCategories table
export const subCategoriesTable = sqliteTable(TABLES.SUB_CATEGORIES, {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  iconName: text("iconName"),
  iconFamily: text("iconFamily"),
  nature: text("nature").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
});

// Labels table
export const labelsTable = sqliteTable(TABLES.LABELS, {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  autoAssign: integer("auto_assign", { mode: "boolean" })
    .notNull()
    .default(false),
});

// Transactions table
export const transactionsTable = sqliteTable(TABLES.TRANSACTIONS, {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  note: text("note"),
  payee: text("payee"),
  date: text("date").notNull(),
  type: text("type").$type<TransactionType>().notNull(),
  accountId: integer("account_id")
    .notNull()
    .references(() => accountsTable.id),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  subCategoryId: integer("sub_category_id").references(
    () => subCategoriesTable.id
  ),
  labelIds: text("label_ids"),
});

// Define the Types directly from the schema
export type Account = typeof accountsTable.$inferSelect;
export type AccountType = typeof accountTypesTable.$inferSelect;
export type Category = typeof categoriesTable.$inferSelect;
export type SubCategory = typeof subCategoriesTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
export type Label = typeof labelsTable.$inferSelect;
