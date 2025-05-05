import {
  BottomSheetContext,
  BottomSheetContextType,
} from "../context/BottomSheetProvider";
import React, { createContext, useContext, useState } from "react";

export const useBottomSheet = (): BottomSheetContextType => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomSheet must be used within a BottomSheetProvider");
  }
  return context;
};
