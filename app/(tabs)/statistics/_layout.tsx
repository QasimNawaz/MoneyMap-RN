import { StyleSheet, View, Text, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import Toolbar from "@/components/Toolbar";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LineChart } from "react-native-gifted-charts";
import { Divider, SegmentedButtons } from "react-native-paper";
import { theme } from "@/constants/theme";
import {
  DateFilter,
  fetchTopTransactionsForStatistics,
  fetchTransactionsForStatistics,
  TransactionForStatistics,
} from "@/db/query/transactionQueries";
import { Account, Transaction } from "@/db/schema";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { ALL_ACCOUNT, fetchAccounts } from "@/db/query/accountQueries";
import PagerView from "react-native-pager-view";
import TabTitle from "@/components/TabTitle";
import TransactionItem from "@/components/TransactionItem";
import { useFocusEffect } from "expo-router";

export default function StatisticsScreen() {
  const { drizzleDb } = useDrizzleDatabase();
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [dateFilterValue, setdateFilterValue] =
    useState<DateFilter>("last7days");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [spentTransactions, setSpentTransactions] = useState<
    TransactionForStatistics[]
  >([]);
  const [incomeTransactions, setIncomeTransactions] = useState<
    TransactionForStatistics[]
  >([]);
  const [topIncomes, setTopIncomes] = useState<Transaction[]>([]);
  const [topSpendings, setTopSpendings] = useState<Transaction[]>([]);

  const loadData = async () => {
    if (!drizzleDb) {
      return;
    }
    try {
      const accountsData = await fetchAccounts(drizzleDb);
      const accountsList = [ALL_ACCOUNT, ...accountsData.list];
      setAccounts(accountsList);
      setSelectedAccounts([ALL_ACCOUNT.id.toString()]);
    } catch (err) {
      console.error("Error loading categories with sub categories:", err);
    }
  };

  const loadTransactions = async () => {
    if (!drizzleDb) {
      return;
    }
    const accountIds = selectedAccounts.includes("-1")
      ? accounts
          .filter((account) => account.id !== -1)
          .map((account) => account.id)
      : selectedAccounts.map((id) => parseInt(id));
    const dateFilter: DateFilter = dateFilterValue;
    const fetchTransactionsForGraph = await fetchTransactionsForStatistics(
      drizzleDb,
      accountIds,
      dateFilter
    );
    const { topIncome, topSpent } = await fetchTopTransactionsForStatistics(
      drizzleDb,
      accountIds,
      dateFilter
    );
    setIncomeTransactions(fetchTransactionsForGraph.income);
    setSpentTransactions(fetchTransactionsForGraph.spent);
    setTopIncomes(topIncome);
    setTopSpendings(topSpent);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [drizzleDb])
  );
  useEffect(() => {
    loadTransactions();
  }, [dateFilterValue, selectedAccounts]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Toolbar
          title="Statistics"
          titleAlignment="center"
          rightIcon={<MaterialIcons name="more" size={30} color="black" />}
          theme="light"
          onActionPress={() => {
            // Handle right icon action
          }}
        />

        <View style={styles.content}>
          {/* Filters Section */}
          <View style={styles.filtersContainer}>
            <SegmentedButtons
              style={styles.dateFilter}
              theme={{
                colors: {
                  secondaryContainer: theme.colors.primary,
                },
              }}
              value={dateFilterValue.toString()}
              onValueChange={(value) => {
                setdateFilterValue(value as DateFilter);
              }}
              density="small"
              buttons={[
                {
                  value: "today",
                  label: "Today",
                },
                {
                  value: "last7days",
                  label: "7D",
                },
                {
                  value: "thisMonth",
                  label: "30D",
                },
                {
                  value: "last6months",
                  label: "6M",
                },

                { value: "year", label: "1Y" },
              ]}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountsScrollViewContent}
            >
              <SegmentedButtons
                multiSelect
                style={styles.accountsSegmentedButtons}
                theme={{
                  colors: {
                    secondaryContainer: theme.colors.primary,
                  },
                }}
                value={selectedAccounts}
                onValueChange={(value) => {
                  if (value.length === 0) {
                    return;
                  }
                  if (value[value.length - 1] === "-1") {
                    setSelectedAccounts(["-1"]);
                    return;
                  }
                  const filteredValues = value.filter((val) => val !== "-1");
                  setSelectedAccounts(filteredValues);
                }}
                density="small"
                buttons={accounts.map((account) => ({
                  showSelectedCheck: true,
                  value: account.id.toString(),
                  label: account.name,
                }))}
              />
            </ScrollView>
          </View>
          {/* Chart Section */}
          <View style={styles.chartContainer}>
            <LineChart
              areaChart
              curved
              data={incomeTransactions}
              data2={spentTransactions}
              spacing={50}
              xAxisLabelTextStyle={{
                width: 50, // Match spacing
                textAlign: "center",
              }}
              height={200}
              showVerticalLines
              showXAxisIndices
              extrapolateMissingValues={true}
              showDataPointsForMissingValues={true}
              interpolateMissingValues={true}
              pointerConfig={{
                pointerStripUptoDataPoint: true,
                pointerStripColor: "lightgray",
                pointerStripWidth: 2,
                strokeDashArray: [2, 5],
                pointerColor: "lightgray",
                radius: 4,
                pointerLabelWidth: 100,
                pointerLabelHeight: 120,
                activatePointersOnLongPress: true, // Add this
                autoAdjustPointerLabelPosition: true, // Add this
                pointerLabelComponent: (items: TransactionForStatistics[]) => {
                  return (
                    <View
                      pointerEvents="none" // Add this
                      style={{
                        height: 120,
                        width: 100,
                        backgroundColor: "#282C3E",
                        borderRadius: 4,
                        justifyContent: "center",
                        paddingLeft: 16,
                      }}
                    >
                      <Text style={{ color: "lightgray", fontSize: 12 }}>
                        {items[0].label}
                      </Text>
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        {items[0].value}
                      </Text>

                      <Text
                        style={{
                          color: "lightgray",
                          fontSize: 12,
                        }}
                      >
                        {items[1].label}
                      </Text>
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        {items[1].value}
                      </Text>
                    </View>
                  );
                },
              }}
              color1="#25A969"
              color2="#F95B51"
              textColor1="#25A969"
              textColor2="#F95B51"
              hideDataPoints
              hideYAxisText
              hideRules
              hideAxesAndRules
              dataPointsColor1="#25A969"
              dataPointsColor2="#F95B51"
              startFillColor1="#25A969"
              startFillColor2="#F95B51"
              startOpacity={0}
              endOpacity={0.3}
            />
          </View>
          {/* Tabs Section */}
          <View style={styles.tabContainer}>
            <View style={styles.tabHeader}>
              <TabTitle
                title="Top Income"
                isActive={currentPage === 0}
                onPress={() => pagerRef.current?.setPage(0)}
              />
              <TabTitle
                title="Top Spending"
                isActive={currentPage === 1}
                onPress={() => pagerRef.current?.setPage(1)}
              />
            </View>
            <PagerView
              ref={pagerRef}
              style={styles.pagerView}
              initialPage={0}
              onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
              <View key="1" style={styles.pageContainer}>
                <FlatList
                  ItemSeparatorComponent={() => <Divider />}
                  data={topIncomes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TransactionItem transaction={item} />
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No income transactions</Text>
                  }
                  contentContainerStyle={styles.listContent}
                />
              </View>
              <View key="2" style={styles.pageContainer}>
                <FlatList
                  ItemSeparatorComponent={() => <Divider />}
                  data={topSpendings}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TransactionItem transaction={item} />
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      No spending transactions
                    </Text>
                  }
                  contentContainerStyle={styles.listContent}
                />
              </View>
            </PagerView>
          </View>
        </View>
      </SafeAreaView>
      <StatusBar style="dark" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // flex: 1,
  },
  filtersContainer: {
    paddingTop: 12,
  },
  dateFilter: {
    marginHorizontal: 12,
  },
  accountsScrollViewContent: {
    paddingVertical: 12,
    justifyContent: "center",
    minWidth: "100%",
  },
  accountsSegmentedButtons: {
    height: 36,
  },
  chartContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  contentScrollView: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: "white",
    overflow: "hidden",
  },
  tabHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 140,
  },
});
