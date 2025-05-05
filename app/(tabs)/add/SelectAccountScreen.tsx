import AccountsList from "@/app/(tabs)/accounts/AccountsList";
import { theme } from "@/constants/theme";
import { fetchAccountsWithAccountType } from "@/db/query/accountQueries";
import { Account, AccountType } from "@/db/schema";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";

interface SelectAccountScreenProps {
  isVisible: boolean;
  onClose: () => void;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
  onAccountSelect: (account: Account) => void;
}

export const SelectAccountScreen: React.FC<SelectAccountScreenProps> = ({
  isVisible,
  onClose,
  scaleAnim,
  opacityAnim,
  onAccountSelect,
}) => {
  if (!isVisible) return null;
  const { drizzleDb } = useDrizzleDatabase();
  const [accounts, setAccounts] = useState<
    (Account & { accountType: AccountType })[]
  >([]);

  const loadData = async () => {
    if (drizzleDb) {
      try {
        const fetchedAccounts = await fetchAccountsWithAccountType(drizzleDb);
        setAccounts(fetchedAccounts.accounts);
      } catch (err) {
        console.error("Error loading accounts:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  const handleAccountSelect = (account: Account) => {
    onAccountSelect(account);
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.accountScreenOverlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.accountScreen,
          {
            transform: [{ scaleY: scaleAnim }],
          },
        ]}
      >
        <View style={styles.accountScreenHeader}>
          <Text style={styles.accountScreenTitle}>Select Account</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <AccountsList
          accounts={accounts}
          onAccountPress={handleAccountSelect}
          showHeader={false}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  accountScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  accountScreen: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.white,
    // padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accountScreenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 16,
    // paddingTop: 40,
    padding: 16,
  },
  accountScreenTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
