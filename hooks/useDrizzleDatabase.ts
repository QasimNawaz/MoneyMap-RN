import { useSQLiteContext } from "expo-sqlite";
import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as schema from "@/db/schema";
import { useState, useEffect } from "react";

interface DrizzleDatabaseState {
  drizzleDb: ExpoSQLiteDatabase<typeof schema> | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
}

interface UseDrizzleDatabaseReturn extends DrizzleDatabaseState {
  resetError: () => void;
}

export const useDrizzleDatabase = (): UseDrizzleDatabaseReturn => {
  const [state, setState] = useState<DrizzleDatabaseState>({
    drizzleDb: null,
    loading: true,
    error: null,
    initialized: false,
  });

  const db = useSQLiteContext();
  useDrizzleStudio(db);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const drizzleInstance = drizzle(db, { schema });

        setState({
          drizzleDb: drizzleInstance,
          loading: false,
          error: null,
          initialized: true,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err : new Error("Unknown error occurred"),
          initialized: false,
        }));
      }
    };

    initializeDatabase();

    return () => {
      // Cleanup if needed
      setState({
        drizzleDb: null,
        loading: false,
        error: null,
        initialized: false,
      });
    };
  }, [db]);

  const resetError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    resetError,
  };
};
