"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface CrockyContextType {
  isNarrationActive: boolean;
  setNarrationActive: (active: boolean) => void;
}

const CrockyContext = createContext<CrockyContextType>({
  isNarrationActive: false,
  setNarrationActive: () => {},
});

export function CrockyProvider({ children }: { children: React.ReactNode }) {
  const [isNarrationActive, setIsNarrationActive] = useState(false);

  const setNarrationActive = useCallback((active: boolean) => {
    setIsNarrationActive(active);
  }, []);

  return (
    <CrockyContext.Provider value={{ isNarrationActive, setNarrationActive }}>
      {children}
    </CrockyContext.Provider>
  );
}

export function useCrocky() {
  return useContext(CrockyContext);
}
