import { theme } from "@/constants/theme";
import { StyleSheet, Text } from "react-native";
import { Pressable } from "react-native";

export interface TabTitleProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

const TabTitle: React.FC<TabTitleProps> = ({ title, isActive, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabTitle, isActive && styles.activeTabTitle]}
    >
      <Text
        style={[styles.tabTitleText, isActive && styles.activeTabTitleText]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default TabTitle;

const styles = StyleSheet.create({
  tabTitle: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTabTitle: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabTitleText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabTitleText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
