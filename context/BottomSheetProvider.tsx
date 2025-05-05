import React, { createContext, useContext, useState, ReactNode } from "react";

export interface BottomSheetContextType {
  isOpen: boolean;
  content: ReactNode | null;
  openBottomSheet: (content: ReactNode) => void;
  closeBottomSheet: () => void;
}

export const BottomSheetContext = createContext<
  BottomSheetContextType | undefined
>(undefined);

export const BottomSheetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const openBottomSheet = (content: ReactNode) => {
    setContent(content);
    setIsOpen(true);
  };

  const closeBottomSheet = () => {
    setIsOpen(false);
    setContent(null);
  };

  return (
    <BottomSheetContext.Provider
      value={{ isOpen, content, openBottomSheet, closeBottomSheet }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};
