import { StyleSheet, View, Animated } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useState, useRef, useCallback } from "react";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import PagerView from "react-native-pager-view";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FirstPage from "./FirstPage";
import SecondPage from "./SecondPage";
import { TransactionType } from "@/types/enums";
import { Account, Label, Transaction } from "@/db/schema";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { fetchAutoAssignedLabels } from "@/db/query/labelQueries";
import {
  fetchSubcategoryWithCategory,
  SubCategoryWithCategory,
} from "@/db/query/categoryQueries";
import { fetchAccount } from "@/db/query/accountQueries";
import { Snackbar } from "react-native-paper";
import { Text } from "react-native";
import { theme } from "@/constants/theme";
import { insertTransaction } from "@/db/query/transactionQueries";
import { useTypedRouter } from "@/hooks/useTypedRouter";

export default function MakeTransactionScreen() {
  const { back } = useTypedRouter();
  const insets = useSafeAreaInsets();
  const { drizzleDb } = useDrizzleDatabase();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const iconAnimation = useRef(new Animated.Value(0)).current;
  const [transactionType, setTransactionType] = useState<TransactionType>(
    TransactionType.Income
  );
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [payee, setPayee] = useState("");
  const [date, setDate] = useState(new Date());
  const [labels, setLabels] = useState<Label[]>([]);
  const [subCategoryWithCategory, setSubCategoryWithCategory] =
    useState<SubCategoryWithCategory | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [visibleSnackBar, setVisibleSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(
    "Something went wrong"
  );

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const labels = await fetchAutoAssignedLabels(drizzleDb);
        const subCategoryWithCategory = await fetchSubcategoryWithCategory(
          drizzleDb
        );
        const account = await fetchAccount(drizzleDb);
        setAccount(account);
        setLabels(labels);
        setSubCategoryWithCategory(subCategoryWithCategory);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  const saveTransaction = async () => {
    if (!drizzleDb) return;
    if (amount === 0) {
      setSnackBarMessage("Amount cannot be zero");
      setVisibleSnackBar(true);
      return;
    }
    try {
      const newEntry: Omit<Transaction, "id"> = {
        amount,
        note: description,
        payee,
        date: date.toISOString(),
        type: transactionType,
        accountId: account!.id,
        categoryId: subCategoryWithCategory!.categoryId,
        subCategoryId: subCategoryWithCategory!.id,
        labelIds: labels.map((label) => label.id).join(","),
      };
      const insertedTransaction = await insertTransaction(drizzleDb, newEntry);
      console.log("Transaction added successfully:", insertedTransaction);
      back();
    } catch (err) {
      console.error("Error in saving transaction:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Reset form state when the screen loses focus
      return () => {
        setAmount(0);
        setPayee("");
        setDescription("");
        setDate(new Date());
        setLabels([]);
        setAccount(null);
        setSubCategoryWithCategory(null);
      };
    }, [drizzleDb])
  );

  // Function to animate icon transition
  const animateIcon = (toValue: number) => {
    Animated.timing(iconAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle page change
  const onPageSelected = (event: any) => {
    const newPage = event.nativeEvent.position;
    setCurrentPage(newPage);
    animateIcon(newPage); // Animate icon transition
  };

  const navigateToPage = (page: number) => {
    pagerRef.current?.setPage(page);
  };

  // const formatAmount = (value: number) => {
  //   return new Intl.NumberFormat("en-US").format(value);
  // };

  const onDismissSnackBar = () => {
    setVisibleSnackBar(false);
    setSnackBarMessage("Something went wrong");
  };

  return (
    <ThemedView style={styles.container}>
      {/* Toolbar */}
      <View
        style={{ paddingTop: insets.top, backgroundColor: Colors.primaryColor }}
      />
      <Toolbar
        leftIcon={
          <Animated.View
            style={{
              transform: [
                {
                  rotate: iconAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"], // Cross (0) → Back Arrow (1)
                  }),
                },
              ],
            }}
          >
            {currentPage === 0 ? (
              <Entypo name="cross" size={30} color="white" />
            ) : (
              <AntDesign name="arrowright" size={30} color="white" />
            )}
          </Animated.View>
        }
        rightIcon={<Entypo name="check" size={30} color="white" />}
        title={currentPage === 1 ? `PKR ${amount.formatAmount()}` : ""}
        titleAlignment="center"
        theme="dark"
        backgroundColor="#2F7E79"
        onActionPress={(action) => {
          if (action === ToolbarAction.LEFT_ICON) {
            if (currentPage === 0) {
              back(); // Close if on first page
            } else {
              pagerRef.current?.setPage(0); // Navigate back to first page
            }
          }
          if (action === ToolbarAction.RIGHT_ICON) {
            saveTransaction();
          }
        }}
      />

      {/* Pager View */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        {/* Page 1 */}
        <View key="1" style={styles.pagerView}>
          <FirstPage
            amount={amount}
            setAmount={setAmount}
            navigateToPage={navigateToPage}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            account={account}
            setAccount={setAccount}
            subCategoryWithCategory={subCategoryWithCategory}
            setSubCategoryWithCategory={setSubCategoryWithCategory}
          />
        </View>
        {/* Page 2 */}
        <View key="2" style={styles.pagerView}>
          <SecondPage
            amount={amount}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            description={description}
            setDescription={setDescription}
            payee={payee}
            setPayee={setPayee}
            date={date}
            setDate={setDate}
            labels={labels}
            setLabels={setLabels}
          />
        </View>
      </PagerView>

      <Snackbar
        style={{ backgroundColor: theme.colors.error }}
        visible={visibleSnackBar}
        onDismiss={onDismissSnackBar}
        duration={Snackbar.DURATION_SHORT}
        action={{
          textColor: theme.colors.white,
          label: "OK",
          onPress: () => {
            onDismissSnackBar();
          },
        }}
      >
        <Text style={{ color: theme.colors.white }}>{snackBarMessage}</Text>
      </Snackbar>
      <StatusBar style="light" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: Colors.primaryColor,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
  amountText: {
    fontSize: 20,
    color: "green",
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#3498db",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
