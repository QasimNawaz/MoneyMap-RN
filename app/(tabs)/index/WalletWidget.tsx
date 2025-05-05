import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "@/constants/Colors";
import { ALL_ACCOUNT } from "@/db/query/accountQueries";
import { Account } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";

interface WalletWidgetProps {
  accounts: Account[];
  totalAmount: number;
  selectedAccount: Account;
  setSelectedAccount: (account: Account) => void;
  incomeTotal: number;
  spentTotal: number;
  onHandleAddAccount: () => void;
}
export const WalletWidget: React.FC<WalletWidgetProps> = ({
  accounts,
  totalAmount,
  selectedAccount,
  setSelectedAccount,
  incomeTotal,
  spentTotal,
  onHandleAddAccount,
}) => {
  return (
    <View style={styles.walletWidget}>
      {/* Total Balance */}
      <Text style={styles.totalBalanceLabel}>Total Balance</Text>
      <Text style={styles.totalBalance}>PKR {totalAmount.formatAmount()}</Text>
      {/* Accounts Badges */}
      <ScrollView
        style={styles.widgetScrollView}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {accounts.map((account, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              selectedAccount?.name === account.name && styles.selectedChip, // Highlight selected chip
            ]}
            onPress={() => setSelectedAccount(account)} // Update selected chip
          >
            <Text
              style={[
                styles.chipText,
                selectedAccount?.name === account.name &&
                  styles.selectedChipText,
              ]}
            >
              {account.name}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Plus Button */}
        <TouchableOpacity
          style={[styles.chip, styles.addChip]}
          onPress={onHandleAddAccount}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.widgetSelectedAccountTrxContainer]}>
        {selectedAccount !== ALL_ACCOUNT && (
          <>
            <Text style={styles.selectedTotalBalanceLabel}>
              Account Balance
            </Text>
            <Text style={styles.selectedTotalBalance}>
              PKR {selectedAccount.amount.formatAmount()}
            </Text>
          </>
        )}
      </View>

      <View style={styles.widgetTrxContainer}>
        <View style={[styles.widgetTrxHalf, styles.widgetTrxLeftView]}>
          <View style={[{ flexDirection: "row", alignItems: "center" }]}>
            <AntDesign
              style={[
                {
                  backgroundColor: "white",
                  borderRadius: 50,
                  opacity: 0.5,
                  padding: 4,
                },
              ]}
              name="arrowdown"
              size={15}
              color="black"
            />
            <Text
              style={[
                {
                  marginStart: 5,
                  color: "white",
                  fontSize: 14,
                },
              ]}
            >
              Income
            </Text>
          </View>
          <Text
            style={[
              {
                marginTop: 6,
                marginStart: 5,
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
              },
            ]}
          >
            PKR {incomeTotal.formatAmount()}
          </Text>
        </View>
        <View style={[styles.widgetTrxHalf, styles.widgetTrxRightView]}>
          <View style={[{ flexDirection: "row", alignItems: "center" }]}>
            <AntDesign
              style={[
                {
                  backgroundColor: "white",
                  borderRadius: 50,
                  opacity: 0.5,
                  padding: 4,
                },
              ]}
              name="arrowup"
              size={15}
              color="black"
            />
            <Text
              style={[
                {
                  marginStart: 5,
                  color: "white",
                  fontSize: 14,
                },
              ]}
            >
              Expenses
            </Text>
          </View>
          <Text
            style={[
              {
                marginTop: 6,
                marginStart: 5,
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
              },
            ]}
          >
            PKR {spentTotal.formatAmount()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    width: "100%",
  },
  content: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    maxWidth: Dimensions.get("window").width * 0.9,
  },
  toolbarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  toolbarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    marginStart: 10,
    color: Colors.white,
  },
  bellIcon: {
    color: Colors.white,
  },
  walletWidget: {
    flexDirection: "column",
    height: 220,
    // marginTop: 20,
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 25,
    borderCurve: "continuous",
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    backgroundColor: Colors.primaryColor,
  },
  totalBalanceLabel: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  totalBalance: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 5,
  },
  selectedTotalBalanceLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 6,
  },
  selectedTotalBalance: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  widgetScrollView: {
    flex: 1,

    marginTop: 10,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  chipsContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  chip: {
    // alignContent: "center",
    // justifyContent: "center",
    // flexDirection: "row",
    // alignItems: "center",
    // height: 40,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "#E0F2F1",
    borderRadius: 50,
    marginHorizontal: 5,
  },
  selectedChip: {
    backgroundColor: Colors.primaryDark,
  },
  chipText: {
    // marginVertical: 5,
    fontSize: 12,
    color: Colors.primaryDark,
    // backgroundColor: Colors.primaryDark,
    fontWeight: "600",
  },
  selectedChipText: {
    color: Colors.onPrimaryColor,
  },
  addChip: {
    backgroundColor: "#4CAF50", // Green background for add button
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  widgetSelectedAccountTrxContainer: {
    flex: 2,
    marginHorizontal: 10,
    marginTop: 6,
    alignItems: "center",
    flexDirection: "column",
  },
  widgetTrxContainer: {
    flex: 2,
    marginHorizontal: 10,
    marginBottom: 6,
    flexDirection: "row", // Arrange children horizontally
  },
  widgetTrxHalf: {
    flex: 1, // Each view takes half of the parent width
    justifyContent: "center",
  },
  widgetTrxLeftView: {
    paddingStart: 10,
    alignItems: "flex-start",
  },
  widgetTrxRightView: {
    paddingEnd: 10,
    alignItems: "flex-end",
  },
});
