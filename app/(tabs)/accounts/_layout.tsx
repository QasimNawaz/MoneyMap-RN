import { ThemedView } from "@/components/ThemedView";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import { fetchAccountsWithAccountType } from "@/db/query/accountQueries";
import { Account, AccountType } from "@/db/schema";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomSheet } from "@/hooks/useBottomSheet";
import { StatusBar } from "expo-status-bar";
import { AddAccountBottomSheet } from "@/components/AddAccountBottomSheet";
import { EditAccountBottomSheet } from "@/components/EditAccountBottomSheetProps";
import AccountsList from "./AccountsList";
import { useFocusEffect } from "expo-router";

export default function AccountsScreen() {
  const { drizzleDb } = useDrizzleDatabase();
  const { isOpen, content, openBottomSheet, closeBottomSheet } =
    useBottomSheet();
  const [accounts, setAccounts] = useState<
    (Account & { accountType: AccountType })[]
  >([]);

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const fetchedAccounts = await fetchAccountsWithAccountType(drizzleDb);
        console.log();
        setAccounts(fetchedAccounts.accounts);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [drizzleDb])
  );

  const handleAddAccount = () => {
    openBottomSheet(
      <AddAccountBottomSheet
        isOpen={isOpen}
        onClose={closeBottomSheet}
        drizzleDb={drizzleDb}
        onSuccess={loadData}
      />
    );
  };

  const handleEditAccount = (account: Account) => {
    openBottomSheet(
      <EditAccountBottomSheet
        isOpen={isOpen}
        onClose={closeBottomSheet}
        onSuccess={loadData}
        accountId={account.id}
        drizzleDb={drizzleDb}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Toolbar
          rightIcon={<Ionicons name="add-circle" size={30} color="black" />}
          title="Accounts"
          titleAlignment="center"
          theme="light"
          onActionPress={(action) => {
            switch (action) {
              case ToolbarAction.RIGHT_ICON:
                handleAddAccount();
                break;
            }
          }}
        />
        <AccountsList accounts={accounts} onAccountPress={handleEditAccount} />
      </SafeAreaView>
      <StatusBar style="dark" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
