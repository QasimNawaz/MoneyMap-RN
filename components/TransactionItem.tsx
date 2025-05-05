import { Transaction } from "@/db/schema";
import { StyleSheet, Text, View } from "react-native";
import { format } from "date-fns";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { fetchSubcategoryById } from "@/db/query/categoryQueries";
import { Account, SubCategory } from "@/db/schema";
import { theme } from "@/constants/theme";
import { getIconComponent } from "@/assets/icons";
import { fetchAccountById } from "@/db/query/accountQueries";
import { TransactionType } from "@/types/enums";
import { useEffect, useState } from "react";

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { drizzleDb } = useDrizzleDatabase();
  const [subCategory, setSubCategory] = useState<SubCategory | null>();
  const [account, setAccount] = useState<Account | null>();
  const loadData = async () => {
    if (drizzleDb) {
      try {
        const subCategoryData = await fetchSubcategoryById(
          Number(transaction.subCategoryId),
          drizzleDb
        );
        const accountData = await fetchAccountById(
          Number(transaction.accountId),
          drizzleDb
        );
        setAccount(accountData);
        setSubCategory(subCategoryData);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  if (!subCategory || !account) return null;
  return (
    <View style={styles.transactionItem}>
      <View style={styles.iconContainer}>
        {getIconComponent(
          subCategory!.iconFamily ?? "FontAwesome",
          subCategory!.iconName ?? "question"
        )}
      </View>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionCategory}>{subCategory.name}</Text>
        <Text style={styles.transactionAccount}>{account.name}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            {
              color:
                transaction.type === TransactionType.Income
                  ? theme.colors.jungleGreen
                  : theme.colors.carnation,
            },
          ]}
        >
          PKR {transaction.amount.formatAmount()}
        </Text>
        <Text style={styles.transactionTime}>
          {format(new Date(transaction.date), "MMM dd, yyyy")}
        </Text>
        <Text style={styles.transactionTime}>
          {format(new Date(transaction.date), "hh:mm a")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    // marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionAccount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  transactionRight: {
    flex: 1,
    alignContent: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  transactionTime: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
});

export default TransactionItem;
