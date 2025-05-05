import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Checkbox } from "react-native-paper";

interface CategoryNatureModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedNature: string) => void;
  defaultNature: string; // Default value passed as a prop
  title: string; // Default value passed as a prop
}

const CategoryNatureModal: React.FC<CategoryNatureModalProps> = ({
  visible,
  onClose,
  onConfirm,
  defaultNature,
  title,
}) => {
  const [selectedNature, setSelectedNature] = useState(defaultNature);

  const handleConfirm = () => {
    onConfirm(selectedNature);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>

          <View style={styles.optionsContainer}>
            {["Must", "Need", "Want"].map((nature) => (
              <TouchableOpacity
                key={nature}
                style={styles.optionButton}
                onPress={() => setSelectedNature(nature)}
              >
                <Checkbox
                  status={selectedNature === nature ? "checked" : "unchecked"}
                  color="#007AFF"
                />
                <Text style={styles.optionText}>{nature}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
  },
  selectedText: {
    color: "white",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    padding: 10,
    margin: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});

export default CategoryNatureModal;
