import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Colors } from "@/constants/Colors";
import { View, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomSheet } from "../hooks/useBottomSheet";

export const BaseBottomSheet: React.FC = () => {
  const { isOpen, content, closeBottomSheet } = useBottomSheet();
  const snapPoints = useMemo(() => ["60%"], []);
  const insets = useSafeAreaInsets();

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        // resetForm();
        // onClose();
      }
    },
    [closeBottomSheet]
  );
  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  if (!isOpen) {
    return <View style={{ display: "none" }} />;
  }

  return (
    <View style={[styles.container, { display: isOpen ? "flex" : "none" }]}>
      <BottomSheet
        onClose={closeBottomSheet}
        enablePanDownToClose={true}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.indicator}
        style={styles.bottomSheet}
      >
        <BottomSheetView
          style={[styles.contentContainer, { paddingBottom: insets.bottom }]}
        >
          {content}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  bottomSheet: {
    zIndex: 10000,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 25,
  },
  indicator: {
    backgroundColor: "#DDDDDD",
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
