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
import {
  deleteLabel,
  fetchLabelById,
  updateLabel,
} from "@/db/query/labelQueries";

interface EditLabelBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  labelId: number;
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")> | null;
}

export const EditLabelBottomSheet: React.FC<EditLabelBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  labelId,
  drizzleDb,
}) => {
  const [labelName, setLabelName] = useState("");
  const [autoAssign, setAutoAssign] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadData = async () => {
      if (drizzleDb && labelId) {
        try {
          const label = await fetchLabelById(labelId, drizzleDb);
          if (label) {
            setLabelName(label.name);
            setAutoAssign(label.autoAssign);
          }
        } catch (error) {
          console.error("Error fetching label:", error);
        }
      }
    };

    loadData();
  }, [drizzleDb]);

  const validateForm = (): boolean => {
    if (!labelName.trim()) {
      setError("Label is required");
      return false;
    }
    return true;
  };

  const handleUpdateLabel = async () => {
    if (!validateForm() || !drizzleDb || !labelId) return;

    try {
      await updateLabel(labelId, labelName, autoAssign, drizzleDb);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to add label");
      console.error("Error adding label:", err);
    }
  };

  const handleDeleteLabel = async () => {
    try {
      if (!drizzleDb || !labelId) return;
      await deleteLabel(labelId, drizzleDb);
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
        <Text style={styles.title}>Edit Label</Text>
        <TouchableOpacity onPress={() => handleDeleteLabel()}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter account name"
        value={labelName}
        onChangeText={(text) => {
          setError(null);
          setLabelName(text);
        }}
        placeholderTextColor="#666"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Auto assign to new records</Text>
        <Switch
          value={autoAssign}
          onValueChange={(newValue) => setAutoAssign(newValue)}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleUpdateLabel()}
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
