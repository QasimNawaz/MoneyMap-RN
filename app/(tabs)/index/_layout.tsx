import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import Toolbar from "@/components/Toolbar";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { Account, Transaction } from "@/db/schema";
import { ALL_ACCOUNT, fetchAccounts } from "@/db/query/accountQueries";
import { useFocusEffect } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useBottomSheet } from "@/hooks/useBottomSheet";
import { AddAccountBottomSheet } from "@/components/AddAccountBottomSheet";
import { StatusBar } from "expo-status-bar";
import {
  fetchFilteredTransactions,
  fetchTransactions,
  TransactionSection,
} from "@/db/query/transactionQueries";
import { Divider } from "react-native-paper";
import { format } from "date-fns";
import { theme } from "@/constants/theme";
import TransactionWithBalanceItem from "@/components/TransactionWithBalanceItem";
import { WalletWidget } from "./WalletWidget";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function HomeScreen() {
  const screenHeight = Dimensions.get("window").height;
  const { drizzleDb } = useDrizzleDatabase();
  const { typedReplace, typedNavigate, back } = useTypedRouter();
  const { isOpen, openBottomSheet, closeBottomSheet } = useBottomSheet();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<Account>(ALL_ACCOUNT);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionSection[]
  >([]);
  const [incomeTotal, setIncomeTotal] = useState<number>(0);
  const [spentTotal, setSpentTotal] = useState<number>(0);

  const loadAccounts = async () => {
    if (drizzleDb) {
      try {
        const { list, totalAmount } = await fetchAccounts(drizzleDb);
        const updatedAccounts = [ALL_ACCOUNT, ...list];

        // Update all states at once
        setTotalAmount(totalAmount);
        setAccounts(updatedAccounts);
        setSelectedAccount(ALL_ACCOUNT);

        return { success: true, accounts: updatedAccounts };
      } catch (err) {
        console.error("Error loading accounts:", err);
        return { success: false, accounts: [] };
      }
    }
    return { success: false, accounts: [] };
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const result = await loadAccounts();
        if (result.success) {
          await loadTransactions(result.accounts);
        }
      };

      loadData();
    }, [drizzleDb])
  );

  const loadTransactions = async (currentAccounts: Account[] = accounts) => {
    if (!drizzleDb || !currentAccounts.length) return;
    try {
      const accountIds =
        selectedAccount.id === -1
          ? currentAccounts
              .filter((account) => account.id !== -1)
              .map((account) => account.id)
          : [selectedAccount.id];
      const filteredTransaction = await fetchFilteredTransactions(
        drizzleDb,
        accountIds,
        [],
        [],
        "last7days"
      );

      const { transactions, incomeTotal, spentTotal } = await fetchTransactions(
        drizzleDb,
        selectedAccount
      );

      setTransactions(transactions);
      setFilteredTransactions(filteredTransaction);
      setIncomeTotal(incomeTotal);
      setSpentTotal(spentTotal);
    } catch (err) {
      console.error("Error loading transactions:", err);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      loadTransactions();
    }
  }, [selectedAccount]);

  const handleAddAccount = () => {
    openBottomSheet(
      <AddAccountBottomSheet
        isOpen={isOpen}
        onClose={closeBottomSheet}
        drizzleDb={drizzleDb}
        onSuccess={loadAccounts}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ImageBackground
        source={require("@assets/images/home-bg.png")}
        style={[styles.imageBackground, { height: screenHeight * 0.25 }]}
        resizeMode="stretch"
      >
        <SafeAreaView style={styles.content}>
          {/* Toolbar */}
          <Toolbar
            leftImage={require("@assets/images/profile-avatar.png")}
            title="Qasim Nawaz"
            titleAlignment="left"
            rightIcon={
              <MaterialIcons name="notifications" size={24} color="white" />
            }
            theme="dark"
            onActionPress={(action) => {}}
          />
        </SafeAreaView>
      </ImageBackground>

      <View style={styles.mainContent}>
        {/* Transactions */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.date.toString()}
          contentContainerStyle={styles.transactionList}
          ListHeaderComponent={() => (
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsHeaderText}>
                Transactions History
              </Text>
              <TouchableOpacity
                style={{
                  alignItems: "flex-end",
                }}
                onPress={() => {
                  typedNavigate("(tabs-nested)/transaction/history", {
                    selectedAccountId: selectedAccount.id,
                  });
                }}
              >
                <Text
                  style={{
                    color: theme.colors.jungleGreen,
                    paddingVertical: 8,
                    fontWeight: "600",
                  }}
                >
                  View More...
                </Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={({ item: section }) => (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionDateText}>
                    {format(new Date(section.date), "dd MMM, yyyy")}
                  </Text>
                  <Text style={styles.sectionBalanceText}>
                    Balance: PKR {section.closingBalance.formatAmount()}
                  </Text>
                </View>
                <Text style={styles.sectionTotalText}>
                  PKR {section.sectionAmount.formatAmount()}
                </Text>
              </View>
              <FlatList
                ItemSeparatorComponent={() => <Divider />}
                data={section.transactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TransactionWithBalanceItem transaction={item} />
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No spending transactions</Text>
                }
                scrollEnabled={false}
              />
            </View>
          )}
        />

        {/* Wallet Widget */}
        <View style={styles.walletWidgetContainer}>
          <WalletWidget
            accounts={accounts}
            totalAmount={totalAmount}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            incomeTotal={incomeTotal}
            spentTotal={spentTotal}
            onHandleAddAccount={handleAddAccount}
          />
        </View>
      </View>
      <StatusBar style="light" />
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    width: "100%",
  },
  mainContent: {
    flex: 1,
  },
  walletWidgetContainer: {
    position: "absolute",
    top: -100,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 16,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  transactionsHeaderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionList: {
    paddingTop: 150,
    paddingBottom: 140,
  },
  content: {
    flex: 1,
  },
  sectionContainer: {
    // marginBottom: 24,
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderLeft: {
    alignItems: "flex-start",
  },
  sectionDateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTotalText: {
    fontSize: 14,
    // fontWeight: "600",
  },
  sectionBalanceText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
});
