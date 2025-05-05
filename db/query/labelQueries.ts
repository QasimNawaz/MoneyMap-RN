import { eq, sql } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { Label, labelsTable } from "@/db/schema";

export const fetchRandomLabel = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Label> => {
  try {
    const labels = await drizzleDb
      .select()
      .from(labelsTable)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return labels[0];
  } catch (error) {
    console.error("Error fetching random label:", error);
    throw error;
  }
};

export const fetchAllLabels = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Label[]> => {
  try {
    return await drizzleDb.select().from(labelsTable);
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw error;
  }
};

export const fetchAutoAssignedLabels = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Label[]> => {
  try {
    return await drizzleDb
      .select()
      .from(labelsTable)
      .where(eq(labelsTable.autoAssign, true));
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw error;
  }
};

export const insertLabel = async (
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>,
  label: Omit<Label, "id">
): Promise<Label> => {
  try {
    const result = await drizzleDb
      .insert(labelsTable)
      .values({
        name: label.name,
        autoAssign: label.autoAssign,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error inserting label:", error);
    throw error;
  }
};

export const fetchLabelById = async (
  labelId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<Label | null> => {
  try {
    const accounts = await drizzleDb
      .select()
      .from(labelsTable)
      .where(eq(labelsTable.id, labelId))
      .limit(1);

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error fetching labels:", error);
    throw error;
  }
};

export const updateLabel = async (
  labelId: number,
  name: string,
  autoAssign: boolean,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<void> => {
  try {
    await drizzleDb
      .update(labelsTable)
      .set({
        name,
        autoAssign,
      })
      .where(eq(labelsTable.id, labelId));

    console.log("Label updated successfully.");
  } catch (error) {
    console.error("Error updating label:", error);
    throw error;
  }
};

export const deleteLabel = async (
  labelId: number,
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")>
): Promise<void> => {
  try {
    await drizzleDb.delete(labelsTable).where(eq(labelsTable.id, labelId));

    console.log("Label deleted successfully.");
  } catch (error) {
    console.error("Error deleting label:", error);
    throw error;
  }
};
