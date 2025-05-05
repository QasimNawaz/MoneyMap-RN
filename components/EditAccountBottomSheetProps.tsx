import React, { useState, useEffect, useRef, isValidElement } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  deleteAccount,
  fetchAccountById,
  insertAccount,
  updateAccount,
} from "@/db/query/accountQueries";
import { Account, AccountType, accountTypesTable } from "@/db/schema";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { fetchAccountTypes } from "@/db/query/accountTypeQueries";
import { Switch } from "react-native-paper";

interface EditAccountBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: number;
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")> | null;
}

export const EditAccountBottomSheet: React.FC<EditAccountBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountId,
  drizzleDb,
}) => {
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [exclude, setExclude] = useState(false);
  const [archive, setArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [selectedAccountTypeId, setSelectedAccountTypeId] = useState<
    number | null
  >(null);
  const [isAccountTypeModalVisible, setIsAccountTypeModalVisible] =
    useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadData = async () => {
      if (drizzleDb && accountId) {
        try {
          const accountTypes = await fetchAccountTypes(drizzleDb);
          setAccountTypes(accountTypes);

          const account = await fetchAccountById(accountId, drizzleDb);
          if (account) {
            setAccountName(account.name);
            setAccountNumber(account.accountNumber);
            setExclude(account.exclude);
            setArchive(account.archive);
            setSelectedAccountTypeId(account.accountTypeId);
          }
        } catch (error) {
          console.error("Error fetching account types:", error);
        }
      }
    };

    loadData();
  }, [drizzleDb]);

  const validateForm = (): boolean => {
    if (!accountName.trim()) {
      setError("Account name is required");
      return false;
    }
    if (!accountNumber.trim() || isNaN(Number(accountNumber))) {
      setError("Valid account number is required");
      return false;
    }
    if (selectedAccountTypeId === null) {
      setError("Account type is required");
      return false;
    }
    return true;
  };

  const handleUpdateAccount = async () => {
    // console.log("handleUpdateAccount", validateForm(), drizzleDb, accountId);
    if (!validateForm() || !drizzleDb || !accountId) return;

    try {
      const updatedAccount = await updateAccount(
        accountId,
        accountName,
        accountNumber,
        exclude,
        archive,
        Number(selectedAccountTypeId),
        drizzleDb
      );
      onSuccess();
      onClose();
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("UNIQUE constraint failed")
      ) {
        setError("Account number already exists");
      } else {
        setError("Failed to add account");
        console.error("Error adding account:", err);
      }
    }
  };

  const handleAccountTypeSelect = (id: number) => {
    setSelectedAccountTypeId(id);
    setIsAccountTypeModalVisible(false);
  };

  const handleDeleteAccount = async () => {
    try {
      if (!drizzleDb || !accountId) return;
      await deleteAccount(accountId, drizzleDb);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
      {/* Title with Delete Icon */}
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.title}>Edit Account</Text>
        <TouchableOpacity onPress={() => handleDeleteAccount()}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter account name"
        value={accountName}
        onChangeText={(text) => {
          setError(null);
          setAccountName(text);
        }}
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter account number"
        value={accountNumber}
        onChangeText={(text) => {
          setError(null);
          setAccountNumber(text);
        }}
        placeholderTextColor="#666"
      />

      {/* Replace Picker with a TouchableOpacity to open the modal */}
      <TouchableOpacity
        style={styles.accountTypeButton}
        onPress={() => setIsAccountTypeModalVisible(true)}
      >
        <Text style={styles.accountTypeButtonText}>
          {accountTypes.find((type) => type.id === selectedAccountTypeId)
            ?.name || "Select Account Type"}
        </Text>
        <Ionicons name="chevron-down" size={20} color={"grey"} />
      </TouchableOpacity>

      {/* Exclude Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Exclude</Text>
        <Switch
          value={exclude}
          onValueChange={(newValue) => setExclude(newValue)}
        />
      </View>

      {/* Archive Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Archive</Text>
        <Switch
          value={archive}
          onValueChange={(newValue) => setArchive(newValue)}
        />
      </View>

      {/* Modal for selecting account type */}
      <Modal
        visible={isAccountTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAccountTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={accountTypes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.accountTypeItem}
                  onPress={() => handleAccountTypeSelect(item.id)}
                >
                  <Text style={styles.accountTypeItemText}>{item.name}</Text>
                  {selectedAccountTypeId === item.id && (
                    <Ionicons name="checkmark" size={20} color={"grey"} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleUpdateAccount()}
      >
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primaryColor,
    textAlign: "center",
  },
  spacer: {
    width: 24, // Same width as the delete icon to balance alignment
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "black",
  },
  accountTypeButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountTypeButtonText: {
    fontSize: 16,
    color: "grey",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
  accountTypeItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountTypeItemText: {
    fontSize: 16,
    color: "grey",
  },
  addButton: {
    backgroundColor: Colors.primaryColor,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
