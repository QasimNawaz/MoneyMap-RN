import { AntDesign } from "@expo/vector-icons";
import { useMemo, useCallback } from "react";
import { Text, View, StyleSheet } from "react-native";
import "../utils/extensions/number";

interface AmountDisplayProps {
  amount: number;
  isIncome: boolean;
  maxWidth: number;
  maxDigits?: number;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  isIncome,
  maxWidth,
  maxDigits = 12,
}) => {
  // const formatAmount = useCallback(
  //   (value: number) => {
  //     const numStr = value.toString();
  //     if (numStr.length > maxDigits) {
  //       return new Intl.NumberFormat("en-US").format(
  //         Number(numStr.slice(0, maxDigits))
  //       );
  //     }
  //     return new Intl.NumberFormat("en-US").format(value);
  //   },
  //   [maxDigits]
  // );

  // Calculate font size based on amount length
  const fontSize = useMemo(() => {
    const amountStr = amount.formatAmount(maxDigits);
    const length = amountStr.length;

    // Base calculation on character count
    if (length <= 6) return 80;
    if (length <= 9) return 60;
    if (length <= 12) return 40;
    return 30;
  }, [amount]);

  return (
    <View style={styles.container}>
      <AntDesign
        name={isIncome ? "plus" : "minus"}
        size={24}
        color="black"
        style={styles.icon}
      />
      <Text style={[styles.amountText, { fontSize }]} numberOfLines={1}>
        {amount.formatAmount(maxDigits)}
      </Text>
      <Text style={styles.currencyText}>PKR</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 40,
  },
  icon: {
    paddingHorizontal: 10,
  },
  amountText: {
    flex: 1,
    textAlign: "right",
  },
  currencyText: {
    fontSize: 20,
    paddingHorizontal: 15,
  },
});

export default AmountDisplay;
