import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { fetchAccountTypeByName } from "@/db/query/accountTypeQueries";
import { Account, AccountType } from "@/db/schema";
import { SafeAreaView } from "react-native-safe-area-context";
import NumericKeyboard from "@/components/NumericKeyboard";
import { StatusBar } from "expo-status-bar";
import { insertAccount } from "@/db/query/accountQueries";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function AddFirstAccount() {
  const { typedReplace } = useTypedRouter();
  const { drizzleDb } = useDrizzleDatabase();
  const [amount, setAmount] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>();

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const accountType = await fetchAccountTypeByName(drizzleDb, "Cash");
        setAccountType(accountType);
      } catch (err) {
        console.error("Error loading accounts:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  const handleNumberSelect = (value: string) => {
    setAmount(Number(value));
  };

  const handleConfirm = async () => {
    if (!drizzleDb) return;
    try {
      const newAccount: Omit<Account, "id"> = {
        name: "CASH",
        accountNumber: "0",
        amount: amount,
        accountTypeId: accountType?.id ?? -1,
        exclude: false,
        archive: false,
      };

      const insertedAccount = await insertAccount(drizzleDb, newAccount);
      console.log("Account added successfully:", insertedAccount);
      typedReplace("(tabs)");
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("UNIQUE constraint failed")
      ) {
      } else {
        console.error("Error adding account:", err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.amountContainer}>
        <Text variant="headlineMedium" style={[{ fontWeight: "bold" }]}>
          Set up your cash balance
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          How much cash do you have in your physical wallet?
        </Text>
        <Text style={[{ fontSize: 50 }]} numberOfLines={1}>
          {amount.formatAmount(12)}
        </Text>
      </View>
      <View style={styles.keyboardContainer}>
        <NumericKeyboard
          onNumberSelect={handleNumberSelect}
          onConfirm={handleConfirm}
          maxDigits={12}
        />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  amountContainer: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
});
