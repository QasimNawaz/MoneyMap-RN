import React from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Label } from "@/db/schema";
import { Divider } from "react-native-paper";

interface LabelsListProps {
  labels: Label[];
  onLabelPress: (label: Label) => void;
  showHeader?: boolean;
  headerTitle?: string;
}

const LabelsList: React.FC<LabelsListProps> = ({
  labels,
  onLabelPress,
  showHeader = true,
  headerTitle = "ALL LABELS",
}) => {
  return (
    <FlatList
      ListHeaderComponent={
        showHeader
          ? () => <Text style={styles.header}>{headerTitle}</Text>
          : null
      }
      ItemSeparatorComponent={() => <Divider />}
      data={labels}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.accountContainer}>
          {/* Account Item */}
          <TouchableOpacity
            onPress={() => onLabelPress(item)}
            style={styles.accountHeader}
          >
            {/* Account Info */}
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
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
  container: {
    flex: 1,
  },

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
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
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

export default LabelsList;
