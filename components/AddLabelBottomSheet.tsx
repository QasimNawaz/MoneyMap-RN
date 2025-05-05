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
import { Label } from "@/db/schema";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { insertLabel } from "@/db/query/labelQueries";
import { Switch } from "react-native-paper";

interface AddLabelBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  drizzleDb: ExpoSQLiteDatabase<typeof import("@/db/schema")> | null;
}

export const AddLabelBottomSheet: React.FC<AddLabelBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  drizzleDb,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [labelName, setLabelName] = useState("");
  const [autoAssign, setAutoAssign] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const resetForm = () => {
    setLabelName("");
    setAutoAssign(false);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!labelName.trim()) {
      setError("Label is required");
      return false;
    }
    return true;
  };

  const handleAddLabel = async () => {
    if (!validateForm() || !drizzleDb) return;
    try {
      const newLabel: Omit<Label, "id"> = {
        name: labelName,
        autoAssign: autoAssign,
      };

      const insertedAccount = await insertLabel(drizzleDb, newLabel);
      console.log("Label added successfully:", insertedAccount);
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to add label");
      console.error("Error adding label:", err);
    }
  };

  return (
    <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>Add Label</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Enter label"
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

      <TouchableOpacity style={styles.addButton} onPress={handleAddLabel}>
        <Text style={styles.buttonText}>Add Label</Text>
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
