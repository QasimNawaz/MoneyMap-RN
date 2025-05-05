import { ThemedView } from "@/components/ThemedView";
import Toolbar, { ToolbarAction } from "@/components/Toolbar";
import { Ionicons } from "@expo/vector-icons";
import { FAB } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { useBottomSheet } from "@/hooks/useBottomSheet";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDrizzleDatabase } from "@/hooks/useDrizzleDatabase";
import { Label } from "@/db/schema";
import { fetchAllLabels } from "@/db/query/labelQueries";
import LabelsList from "./LabelsList";
import { AddLabelBottomSheet } from "@/components/AddLabelBottomSheet";
import { EditLabelBottomSheet } from "@/components/EditLabelBottomSheet";

export default function EditLabelsScreen() {
  const { drizzleDb } = useDrizzleDatabase();
  const router = useRouter();
  const { isOpen, content, openBottomSheet, closeBottomSheet } =
    useBottomSheet();
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

  const handleEditLabel = (label: Label) => {
    openBottomSheet(
      <EditLabelBottomSheet
        isOpen={isOpen}
        onClose={closeBottomSheet}
        onSuccess={loadData}
        labelId={label.id}
        drizzleDb={drizzleDb}
      />
    );
  };

  const handleAddLabel = () => {
    openBottomSheet(
      <AddLabelBottomSheet
        isOpen={isOpen}
        onClose={closeBottomSheet}
        drizzleDb={drizzleDb}
        onSuccess={loadData}
      />
    );
  };
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Toolbar
          leftIcon={
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color="black"
            />
          }
          title="Edit Labels"
          titleAlignment="left"
          theme="light"
          onActionPress={(action) => {
            switch (action) {
              case ToolbarAction.LEFT_ICON:
                router.back();
                break;
            }
          }}
        />
        <LabelsList labels={labels} onLabelPress={handleEditLabel}></LabelsList>
        <FAB
          style={[
            styles.fab,
            {
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
          icon="plus"
          color="white"
          onPress={() => {
            handleAddLabel();
          }}
        />
      </SafeAreaView>
      <StatusBar style="dark" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 30,
    bottom: 60,
    backgroundColor: Colors.primaryColor,
  },
});
