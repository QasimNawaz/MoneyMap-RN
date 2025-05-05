import { icons, IconType } from "@/assets/icons";
import React from "react";
import { Text, View } from "react-native";

// Make sure route is of type 'IconType'
interface Props {
  route: IconType; // Type route to only accept valid keys from icons
  color: string;
}

const TabIcon: React.FC<Props> = ({ route, color }) => {
  return (
    <View>
      {icons[route] ? (
        icons[route]({ color })
      ) : (
        <Text>Icon not found</Text> // Fallback UI
      )}
    </View>
  );
};

export default TabIcon;
