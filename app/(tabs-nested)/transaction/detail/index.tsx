import { ThemedView } from "@/components/ThemedView";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactElement, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Image } from "react-native";
import { theme } from "@/constants/theme";
import PagerView from "react-native-pager-view";
import Dots from "react-native-dots-pagination";
import { Divider, SegmentedButtons, Checkbox } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { List } from "react-native-paper";
import { Account, Label } from "@/db/schema";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { ALL_ACCOUNT, fetchAccounts } from "@/db/query/accountQueries";
import { fetchAllLabels } from "@/db/query/labelQueries";
import {
  DateFilter,
  fetchFilteredTransactions,
  TransactionSection,
} from "@/db/query/transactionQueries";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import {
  CategoryWithSubcategories,
  fetchCategoriesWithSubcategories,
} from "@/db/query/categoryQueries";
import TransactionItem from "@/components/TransactionItem";

export default function TransactionHistory(): ReactElement {
  const router = useRouter();
  const snapPoints = useMemo(() => ["15%", "30%", "80%"], []);
  const { selectedAccountId } = useLocalSearchParams<{
    selectedAccountId: string;
  }>();
  const { drizzleDb } = useDrizzleDatabase();
  const sheetRef = useRef<BottomSheet>(null);
  const [sheetExpended, setSheetExpended] = React.useState(false);
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionSection[]
  >([]);

  const [dateFilterValue, setdateFilterValue] =
    useState<DateFilter>("last7days");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>();
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    {
      categoryId: number;
      subcategoryId: number;
    }[]
  >([]);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    console.log("Selected StartDate", selectedDate);
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    console.log("Selected EndDate", selectedDate);
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSheetChange = useCallback((index: number) => {
    setSheetExpended(index === 1);
  }, []);

  const onPageSelected = (event: any) => {
    const newPage = event.nativeEvent.position;
    setCurrentPage(newPage);
  };

  const toggleExpand = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const toggleSubcategory = (categoryId: number, subcategoryId: number) => {
    setSelectedSubcategories((prev) => {
      const catId = categoryId;
      const subId = subcategoryId;

      const exists = prev.some(
        (item) => item.categoryId === catId && item.subcategoryId === subId
      );

      if (exists) {
        return prev.filter(
          (item) => !(item.categoryId === catId && item.subcategoryId === subId)
        );
      }

      return [...prev, { categoryId: catId, subcategoryId: subId }];
    });
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
    const labelIds = selectedLabels.map((id) => parseInt(id));
    const dateFilter: DateFilter =
      currentPage === 0 ? dateFilterValue : { startDate, endDate };

    const filteredTransaction = await fetchFilteredTransactions(
      drizzleDb,
      accountIds,
      labelIds,
      selectedSubcategories,
      dateFilter
    );
    setFilteredTransactions(filteredTransaction);
  };

  const loadData = async () => {
    if (!drizzleDb) {
      return;
    }
    try {
      const accountsData = await fetchAccounts(drizzleDb);
      const labelsData = await fetchAllLabels(drizzleDb);
      const categoriesData = await fetchCategoriesWithSubcategories(drizzleDb);
      const accountsList = [ALL_ACCOUNT, ...accountsData.list];
      setAccounts(accountsList);
      setLabels(labelsData);
      setCategories(categoriesData);
      const selAcc = accountsList
        .filter((acc) => acc.id === Number(selectedAccountId))
        .map((acc) => acc.id.toString());
      setSelectedAccounts(selAcc);
    } catch (err) {
      console.error("Error loading categories with sub categories:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  useEffect(() => {
    loadTransactions();
  }, [
    dateFilterValue,
    selectedAccounts,
    selectedLabels,
    searchQuery,
    startDate,
    endDate,
    currentPage,
    selectedSubcategories,
  ]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Toolbar
          leftIcon={
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color="black"
            />
          }
          title="Records"
          titleAlignment="left"
          theme="light"
          showSearch={true}
          onSearch={(text) => setSearchQuery(text)}
          onActionPress={(action) => {
            switch (action) {
              case ToolbarAction.LEFT_ICON:
                router.back();
                break;
            }
          }}
        />

        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.date.toString()}
          contentContainerStyle={styles.transactionList}
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
                  <TransactionItem transaction={item} />
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        />

        <BottomSheet
          backgroundStyle={{ backgroundColor: "transparent" }}
          detached={false}
          ref={sheetRef}
          handleComponent={() => (
            <BottomSheetView
              style={{
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                alignItems: "center",
              }}
            >
              <View style={styles.handleContainer}>
                <Image
                  style={styles.handleImage}
                  resizeMethod="auto"
                  source={require("@assets/images/bs-handle-icon-bg.png")}
                />
                <MaterialIcons
                  name={
                    sheetExpended ? "keyboard-arrow-down" : "keyboard-arrow-up"
                  }
                  size={24}
                  color="black"
                  style={styles.handleIcon}
                />
              </View>
            </BottomSheetView>
          )}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          onChange={handleSheetChange}
        >
          <BottomSheetView style={styles.contentContainer}>
            <View style={styles.filterContainer}>
              <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                onPageSelected={onPageSelected}
              >
                {/* Page 1 */}
                <View key="1" style={styles.pageContainer}>
                  <SegmentedButtons
                    style={{ marginHorizontal: 12, marginTop: 12 }}
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
                </View>
                {/* Page 2 */}
                <View key="2" style={styles.pageContainer}>
                  <SegmentedButtons
                    multiSelect
                    style={{ marginHorizontal: 12, marginTop: 12 }}
                    // theme={{
                    //   colors: {
                    //     // secondaryContainer: theme.colors.primary,
                    //   },
                    // }}
                    value={["startDate", "endDate"]}
                    onValueChange={(value) => {
                      console.log("Value", value);
                      if (value.includes("startDate")) {
                        console.log("Setting StartDate");
                        setShowStartDatePicker(true);
                      } else if (value.includes("endDate")) {
                        console.log("Setting EndDate");
                        setShowEndDatePicker(true);
                      }
                    }}
                    density="small"
                    buttons={[
                      {
                        value: "endDate",
                        label: format(endDate, "dd MMM, yyyy"),
                        checkedColor: theme.colors.primary,
                        uncheckedColor: theme.colors.primary,
                      },
                      {
                        disabled: true,
                        value: "-",
                        label: "-",
                      },
                      {
                        value: "startDate",
                        label: format(startDate, "dd MMM, yyyy"),
                        checkedColor: theme.colors.primary,
                        uncheckedColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
              </PagerView>
              <Dots length={2} active={currentPage} />
            </View>

            <View style={styles.filtersSection}>
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

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.labelsScrollViewContent}
              >
                <SegmentedButtons
                  multiSelect
                  style={styles.accountsSegmentedButtons}
                  theme={{
                    colors: {
                      secondaryContainer: theme.colors.primary,
                    },
                  }}
                  value={selectedLabels}
                  onValueChange={(value) => {
                    setSelectedLabels(value);
                  }}
                  density="small"
                  buttons={labels.map((label) => ({
                    showSelectedCheck: true,
                    value: label.id.toString(),
                    label: label.name,
                  }))}
                />
              </ScrollView>

              <ScrollView
                style={styles.categoriesScrollView}
                contentContainerStyle={styles.categoriesScrollViewContent}
                showsVerticalScrollIndicator={false}
              >
                {categories.map((category) => (
                  <List.Accordion
                    key={category.id}
                    title={category.name}
                    theme={{
                      colors: {
                        background: theme.colors.tabBar,
                      },
                    }}
                    expanded={category.expanded}
                    onPress={() => toggleExpand(category.id)}
                  >
                    {category.subcategories.map((subcategory) => (
                      <View key={subcategory.id} style={{ padding: 8 }}>
                        <Checkbox.Item
                          label={subcategory.name}
                          status={
                            selectedSubcategories.some(
                              (item) =>
                                item.categoryId === category.id &&
                                item.subcategoryId === subcategory.id
                            )
                              ? "checked"
                              : "unchecked"
                          }
                          onPress={() =>
                            toggleSubcategory(category.id, subcategory.id)
                          }
                        />
                        <Divider />
                      </View>
                    ))}
                  </List.Accordion>
                ))}
              </ScrollView>
            </View>
          </BottomSheetView>
        </BottomSheet>

        {showStartDatePicker && (
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerContent}>
              <DateTimePicker
                textColor="black"
                display="spinner"
                value={startDate}
                mode="date"
                minimumDate={new Date(2020, 0, 1)}
                maximumDate={new Date()}
                onChange={onStartDateChange}
              />
            </View>
          </View>
        )}

        {showEndDatePicker && (
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerContent}>
              <DateTimePicker
                textColor="black"
                display="spinner"
                value={endDate}
                mode="date"
                minimumDate={new Date(2020, 0, 1)}
                maximumDate={new Date()}
                onChange={onEndDateChange}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
      <StatusBar style="dark" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handleContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  handleImage: {
    resizeMode: "contain",
  },
  handleIcon: {
    position: "absolute",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.tabBar,
  },
  filterContainer: {
    height: 100,
  },
  pagerView: {
    height: 80,
  },

  filtersSection: {
    paddingTop: 16,
    gap: 16,
    flex: 1,
  },
  accountsScrollViewContent: {
    paddingHorizontal: 16,
    justifyContent: "center",
    minWidth: "100%",
    height: 50,
  },
  labelsScrollViewContent: {
    paddingHorizontal: 16,
    justifyContent: "center",
    minWidth: "100%",
    height: 50,
  },
  categoriesScrollView: {
    // maxHeight: "50%", // Adjust this value based on your needs
    flexGrow: 0,
  },
  categoriesScrollViewContent: {
    // paddingHorizontal: 16,
    paddingBottom: 16,
  },
  accountsSegmentedButtons: {
    height: 36,
  },
  pageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionList: {
    paddingBottom: 140,
  },

  sectionContainer: {},
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
  datePickerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerContent: {
    backgroundColor: theme.colors.softTeal,
    borderRadius: 12,
    padding: 16,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
