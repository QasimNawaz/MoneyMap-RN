import LabelsList from "@/app/(tabs-nested)/labels/LabelsList";
import { theme } from "@/constants/theme";
import { fetchAllLabels } from "@/db/query/labelQueries";
import { Label } from "@/db/schema";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { View, Text, StyleSheet, Animated } from "react-native";

interface SelectLabelScreenProps {
  isVisible: boolean;
  onClose: () => void;
  scaleAnim: Animated.Value;
  opacityAnim: Animated.Value;
  onLabelSelect: (label: Label) => void;
}

export const SelectLabelScreen: React.FC<SelectLabelScreenProps> = ({
  isVisible,
  onClose,
  scaleAnim,
  opacityAnim,
  onLabelSelect,
}) => {
  if (!isVisible) return null;
  const { drizzleDb } = useDrizzleDatabase();
  const [labels, setLabels] = useState<Label[]>([]);
  const loadData = async () => {
    if (drizzleDb) {
      try {
        const data = await fetchAllLabels(drizzleDb);
        console.log("labels", data);
        setLabels(data);
      } catch (err) {
        console.error("Error loading categories with sub categories:", err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [drizzleDb]);

  const handleLabelSelect = (label: Label) => {
    onLabelSelect(label);
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.labelScreenOverlay,
        {
          opacity: opacityAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.labelScreen,
          {
            transform: [{ scaleY: scaleAnim }],
          },
        ]}
      >
        <View style={styles.labelScreenHeader}>
          <Text style={styles.labelScreenTitle}>Select Label</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <LabelsList
          labels={labels}
          onLabelPress={handleLabelSelect}
          showHeader={false}
        ></LabelsList>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  labelScreen: {
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
  labelScreenHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    // paddingTop: 40,
  },
  labelScreenTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
