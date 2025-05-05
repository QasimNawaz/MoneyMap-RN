import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome,
  Ionicons,
  Feather,
  Zocial,
} from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const iconFamilies = [
  { name: "MaterialIcons", component: MaterialIcons },
  { name: "Ionicons", component: Ionicons },
  { name: "Feather", component: Feather },
  { name: "Zocial", component: Zocial },
];

export type IconItem = {
  familyName: string;
  iconName: string;
  IconComponent: any;
};

interface IconPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: IconItem) => void;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({
  visible,
  onClose,
  onSelectIcon,
}) => {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIcons = async () => {
      const allIcons: IconItem[] = [];

      for (const { name, component: IconComponent } of iconFamilies) {
        if (IconComponent?.glyphMap) {
          for (const iconName of Object.keys(IconComponent.glyphMap)) {
            await new Promise((resolve) => setTimeout(resolve, 10));
            allIcons.push({
              familyName: name,
              iconName,
              IconComponent,
            });
            setIcons([...allIcons]);
          }
        }
      }
      setLoading(false);
    };

    loadIcons();
  }, []);

  const renderItem = ({ item }: { item: IconItem }) => (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => onSelectIcon(item)}
    >
      <item.IconComponent name={item.iconName} size={32} color="black" />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={styles.loadingText}>Loading icons...</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Icon</Text>

          <FlatList
            data={icons}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              `${item.familyName}-${item.iconName}-${index}`
            }
            numColumns={4}
            contentContainerStyle={styles.content}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            updateCellsBatchingPeriod={50}
            windowSize={25}
            ListFooterComponent={renderFooter}
          />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");

// Styles for modal
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.8,
    height: height * 0.8,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  iconButton: {
    margin: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  closeText: {
    color: "white",
    fontSize: 16,
  },

  content: {
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
});

export default IconPickerModal;
