import AmountDisplay from "@/components/AmountDisplay";
import CustomKeyboard from "@/components/CustomKeyboard";
import { theme } from "@/constants/theme";
import { SubCategoryWithCategory } from "@/db/query/categoryQueries";
import { Account } from "@/db/schema";
import { TransactionType } from "@/types/enums";
import { AntDesign } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Animated, Text } from "react-native";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { SelectAccountScreen } from "./SelectAccountScreen";
import { SelectCategoryScreen } from "./SelectCategoryScreen";
import { useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";

interface FirstPageProps {
  amount: number;
  setAmount: (value: number) => void;
  navigateToPage: (page: number) => void;
  transactionType: TransactionType;
  setTransactionType: (type: TransactionType) => void;
  account: Account | null;
  setAccount: (account: Account) => void;
  subCategoryWithCategory: SubCategoryWithCategory | null;
  setSubCategoryWithCategory: (
    subCategoryWithCategory: SubCategoryWithCategory
  ) => void;
}

const FirstPage: React.FC<FirstPageProps> = ({
  amount,
  setAmount,
  navigateToPage,
  transactionType,
  setTransactionType,
  account,
  setAccount,
  subCategoryWithCategory,
  setSubCategoryWithCategory,
}) => {
  const maxDigits = 14;
  const [isAccountScreenOpen, setIsAccountScreenOpen] = useState(false);
  const [isCategoryScreenOpen, setIsCategoryScreenOpen] = useState(false);
  const accountScaleAnim = useState(new Animated.Value(0))[0];
  const accountOpacityAnim = useState(new Animated.Value(0))[0];
  const categoryScaleAnim = useState(new Animated.Value(0))[0];
  const categoryOpacityAnim = useState(new Animated.Value(0))[0];

  const openAccountScreen = () => {
    setIsAccountScreenOpen(true);
    Animated.parallel([
      Animated.spring(accountScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(accountOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeAccountScreen = () => {
    Animated.parallel([
      Animated.spring(accountScaleAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(accountOpacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setIsAccountScreenOpen(false));
  };

  const openCategoryScreen = () => {
    setIsCategoryScreenOpen(true);
    Animated.parallel([
      Animated.spring(categoryScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(categoryOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeCategoryScreen = () => {
    Animated.parallel([
      Animated.spring(categoryScaleAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(categoryOpacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setIsCategoryScreenOpen(false));
  };

  const handleNumberSelect = (value: string) => {
    if (value.length <= maxDigits) {
      setAmount(Number(value));
    }
  };

  const onValueChange = (itemValue: string) => {
    setTransactionType(
      itemValue === "Income" ? TransactionType.Income : TransactionType.Spent
    );
  };

  useFocusEffect(
    useCallback(() => {
      // load data when screen gets in focus
      // loadData();
      // Reset form state when the screen loses focus
      return () => {
        setIsAccountScreenOpen(false);
        setIsCategoryScreenOpen(false);
      };
    }, [])
  );

  return (
    <View style={styles.page}>
      {/* Tabs */}
      <SegmentedButtons
        style={{ marginHorizontal: 20, marginVertical: 10 }}
        value={transactionType}
        onValueChange={onValueChange}
        density="regular"
        buttons={[
          {
            style: {
              backgroundColor:
                transactionType === TransactionType.Income
                  ? theme.colors.warnOrange
                  : theme.colors.softTeal,
            },
            checkedColor: "white",
            uncheckedColor: "white",
            value: "Income",
            label: "Income",
            icon: () => <AntDesign name="arrowdown" size={24} color="white" />,
          },
          {
            style: {
              backgroundColor:
                transactionType === TransactionType.Income
                  ? theme.colors.softTeal
                  : theme.colors.warnOrange,
            },
            checkedColor: "white",
            uncheckedColor: "white",
            value: "Spent",
            label: "Expense",
            icon: () => <AntDesign name="arrowup" size={24} color="white" />,
          },
        ]}
      />
      {/* Amount Container */}
      <View style={styles.ammountContainer}>
        <AmountDisplay
          amount={amount}
          isIncome={transactionType === TransactionType.Income ? true : false}
          maxWidth={250}
          maxDigits={maxDigits}
        />
        <TouchableOpacity
          onPress={() => {
            navigateToPage(1);
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              width: 30,
              height: "80%",
              alignSelf: "center",
              // backgroundColor: Colors.orange,
            }}
            source={require("@assets/images/left-slide-in.png")}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.accountCategoryContainer}>
        {/* Account Chip */}
        <TouchableOpacity
          style={styles.box}
          onPress={() => {
            openAccountScreen();
          }}
        >
          <Text style={styles.boxLabel}>Account</Text>
          <Text style={styles.boxText}>
            {account?.name || "Select Account"}
          </Text>
        </TouchableOpacity>
        {/* Category Chip */}
        <TouchableOpacity
          style={styles.box}
          onPress={() => {
            openCategoryScreen();
          }}
        >
          <Text style={styles.boxLabel}>Category</Text>
          <Text style={styles.boxText}>
            {subCategoryWithCategory?.name || "Select Category"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Keyboard */}
      <View style={styles.keyboardContainer}>
        <CustomKeyboard
          style={{ alignSelf: "stretch" }}
          onNumberSelect={handleNumberSelect}
          height={300}
          fontSize={28}
          maxDigits={maxDigits}
        />
      </View>
      <SelectAccountScreen
        isVisible={isAccountScreenOpen}
        onClose={closeAccountScreen}
        scaleAnim={accountScaleAnim}
        opacityAnim={accountOpacityAnim}
        onAccountSelect={setAccount}
      />
      <SelectCategoryScreen
        isVisible={isCategoryScreenOpen}
        onClose={closeCategoryScreen}
        scaleAnim={categoryScaleAnim}
        opacityAnim={categoryOpacityAnim}
        setSubCategoryWithCategory={setSubCategoryWithCategory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
  },
  ammountContainer: {
    flex: 1,
    // backgroundColor: Colors.orange,
    // paddingVertical: 40,
    flexDirection: "row",
    alignItems: "center",
    // alignItems: "center",
    // justifyContent: "center",
  },
  accountCategoryContainer: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 10,
  },
  box: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    minHeight: 70,
  },
  boxLabel: {
    fontSize: 12,
    color: theme.colors.grey400,
    marginBottom: 4,
  },
  boxText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  keyboardContainer: {
    backgroundColor: "#F5F5F5",
    // paddingBottom: 30,
    alignSelf: "stretch",
    justifyContent: "flex-end",
  },
});

export default FirstPage;
