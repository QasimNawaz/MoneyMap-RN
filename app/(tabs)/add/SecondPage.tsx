import CustomInput from "@/components/CustomInput";
import { theme } from "@/constants/theme";
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { Chip, Divider } from "react-native-paper";
import { SelectLabelScreen } from "./SelectLabelScreen";
import { Label } from "@/db/schema";
import { TransactionType } from "@/types/enums";
import DateTimePicker from "@react-native-community/datetimepicker";

interface SecondPageProps {
  amount: number;
  transactionType: TransactionType;
  setTransactionType: (type: TransactionType) => void;
  description: string;
  setDescription: (desc: string) => void;
  payee: string;
  setPayee: (payee: string) => void;
  date: Date;
  setDate: (date: Date) => void;
  labels: Label[];
  setLabels: (labels: Label[]) => void;
}

const SecondPage: React.FC<SecondPageProps> = ({
  amount,
  transactionType,
  setTransactionType,
  description,
  setDescription,
  payee,
  setPayee,
  date,
  setDate,
  labels,
  setLabels,
}) => {
  const [isLabelScreenOpen, setIsLabelScreenOpen] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDate(selectedTime);
    }
  };

  const openLabelScreen = () => {
    setIsLabelScreenOpen(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeLabelScreen = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setIsLabelScreenOpen(false));
  };

  const handleLabelSelect = (label: Label) => {
    if (!labels.find((l) => l.id === label.id)) {
      setLabels([...labels, label]);
    }
  };

  const handleRemoveLabel = (labelId: number) => {
    setLabels(labels.filter((label) => label.id !== labelId));
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.page}>
          <Text style={styles.chipLabel}>Note</Text>
          <CustomInput
            label=""
            value={description}
            onChangeText={setDescription}
            width="100%"
            customColors={{
              focused: theme.colors.primary,
              unfocused: theme.colors.grey400,
              error: "#FF3B30",
            }}
            style={{ marginTop: 0, marginBottom: 16 }}
          />
          <View style={styles.chipContainer}>
            <Text style={styles.chipLabel}>Labels</Text>
            <View style={styles.chipsWrapper}>
              {labels.map((label) => (
                <Chip
                  key={label.id}
                  mode="flat"
                  onClose={() => handleRemoveLabel(label.id)}
                  style={[
                    styles.chip,
                    { backgroundColor: theme.colors.warnOrange },
                  ]}
                >
                  {label.name}
                </Chip>
              ))}
              <Chip
                mode="outlined"
                onPress={openLabelScreen}
                style={styles.chip}
                icon="plus"
              >
                Add Labels
              </Chip>
            </View>
          </View>
          <Divider
            style={{ marginVertical: 14 }}
            theme={{ colors: { outlineVariant: theme.colors.grey400 } }}
          />
          <Text style={styles.chipLabel}>
            {transactionType === TransactionType.Spent ? "Payer" : "Payee"}
          </Text>
          <CustomInput
            label=""
            value={payee}
            onChangeText={setPayee}
            width="100%"
            customColors={{
              focused: theme.colors.primary,
              unfocused: theme.colors.grey400,
              error: "#FF3B30",
            }}
            style={{ marginTop: 0, marginBottom: 16 }}
          />

          <Text style={styles.chipLabel}>Date & Time</Text>
          <View style={styles.dateWrapper}>
            <Chip
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateChip}
              icon="calendar"
            >
              <Text>{date.toLocaleDateString()}</Text>
            </Chip>

            <Chip
              mode="outlined"
              onPress={() => setShowTimePicker(true)}
              style={styles.dateChip}
              icon="clock-outline"
            >
              <Text>
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Chip>
          </View>

          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerContent}>
                <DateTimePicker
                  textColor="black"
                  display="spinner"
                  value={date}
                  mode="date"
                  onChange={onDateChange}
                />
              </View>
            </View>
          )}

          {showTimePicker && (
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerContent}>
                <DateTimePicker
                  textColor="black"
                  display="spinner"
                  value={date}
                  mode="time"
                  onChange={onTimeChange}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <SelectLabelScreen
        isVisible={isLabelScreenOpen}
        onClose={closeLabelScreen}
        scaleAnim={scaleAnim}
        opacityAnim={opacityAnim}
        onLabelSelect={handleLabelSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  chipContainer: {
    width: "100%",
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.backdrop,
  },
  chipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    alignItems: "center",
    marginTop: 14,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  dateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  dateChip: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
  amountText: {
    fontSize: 20,
    color: "green",
    marginTop: 10,
  },
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
    backgroundColor: "white",
    padding: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 40,
  },
  labelScreenTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  datePickerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerContent: {
    backgroundColor: theme.colors.softTeal,
    borderRadius: 12,
    padding: 16,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SecondPage;
