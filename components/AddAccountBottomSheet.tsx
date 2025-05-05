import React, { useState, useEffect, useRef } from "react";
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
import { insertAccount } from "@/db/query/accountQueries";
import { Account, AccountType, accountTypesTable } from "@/db/schema";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { fetchAccountTypes } from "@/db/query/accountTypeQueries";

interface AddAccountBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")> | null;
}

export const AddAccountBottomSheet: React.FC<AddAccountBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  drizzleDb,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
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
      if (drizzleDb) {
        try {
          const accountTypes = await fetchAccountTypes(drizzleDb);
          setAccountTypes(accountTypes);
          setSelectedAccountTypeId(accountTypes[0]?.id || null); // Set default as the first account type
        } catch (error) {
          console.error("Error fetching account types:", error);
        }
      }
    };

    loadData();
  }, [drizzleDb]);

  const resetForm = () => {
    setAccountName("");
    setAccountNumber("");
    setAmount("");
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!accountName.trim()) {
      setError("Account name is required");
      return false;
    }
    if (!accountNumber.trim() || isNaN(Number(accountNumber))) {
      setError("Valid account number is required");
      return false;
    }
    if (!amount.trim() || isNaN(Number(amount))) {
      setError("Valid amount is required");
      return false;
    }
    if (selectedAccountTypeId === null) {
      setError("Account type is required");
      return false;
    }
    return true;
  };

  const handleAddAccount = async () => {
    if (!validateForm() || !drizzleDb) return;
    const validAccountTypeId = selectedAccountTypeId ?? 0;
    try {
      const newAccount: Omit<Account, "id"> = {
        name: accountName,
        accountNumber: accountNumber,
        amount: Number(amount),
        accountTypeId: validAccountTypeId,
        exclude: false,
        archive: false,
      };

      const insertedAccount = await insertAccount(drizzleDb, newAccount);
      console.log("Account added successfully:", insertedAccount);

      resetForm();
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
    setIsAccountTypeModalVisible(false); // Close the modal after selection
  };

  return (
    <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Add Account</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Enter initial amount"
        value={amount}
        onChangeText={(text) => {
          setError(null);
          setAmount(text);
        }}
        keyboardType="numeric"
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

      <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
        <Text style={styles.buttonText}>Add Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.primaryColor,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  accountTypeButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    // marginBottom: 15,
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
