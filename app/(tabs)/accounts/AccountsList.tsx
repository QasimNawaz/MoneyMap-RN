import React from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Account, AccountType } from "@/db/schema";
import { Colors } from "@/constants/Colors";
import { getIconComponent } from "@/assets/icons";
import { Divider } from "react-native-paper";

interface AccountsListProps {
  accounts: (Account & { accountType: AccountType })[];
  onAccountPress: (account: Account) => void;
  showHeader?: boolean;
  headerTitle?: string;
}

const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  onAccountPress,
  showHeader = true,
  headerTitle = "ALL ACCOUNTS",
}) => {
  return (
    <FlatList
      ListHeaderComponent={
        showHeader
          ? () => <Text style={styles.header}>{headerTitle}</Text>
          : null
      }
      ItemSeparatorComponent={() => <Divider />}
      data={accounts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.accountContainer}>
          {/* Account Item */}
          <TouchableOpacity
            onPress={() => onAccountPress(item)}
            style={styles.accountHeader}
          >
            {/* Account Type Icon */}
            <View style={styles.iconContainer}>
              {getIconComponent(
                item.accountType.iconFamily ?? "FontAwesome",
                item.accountType.iconName ?? "question"
              )}
            </View>

            {/* Account Info */}
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>{item.accountNumber}</Text>
            </View>

            {/* Arrow Icon */}
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color="#000"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  accountContainer: {
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    fontSize: 20,
    paddingVertical: 15,
    fontWeight: "bold",
  },
  accountHeader: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  arrowIcon: {
    marginLeft: 10,
  },
});

export default AccountsList;
