"use client";

import { createContext, useContext, useMemo, useState } from "react";

type SpeechSettingsContextValue = {
  tolerance: number;
  setTolerance: (value: number) => void;
};

const SpeechSettingsContext = createContext<SpeechSettingsContextValue | null>(null);

export function SpeechSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tolerance, setTolerance] = useState<number>(1);

  const value = useMemo(
    () => ({
      tolerance,
      setTolerance,
    }),
    [tolerance],
  );

  return (
    <SpeechSettingsContext.Provider value={value}>
      {children}
    </SpeechSettingsContext.Provider>
  );
}

export function useSpeechSettings() {
  const context = useContext(SpeechSettingsContext);

  if (!context) {
    throw new Error("useSpeechSettings must be used within a SpeechSettingsProvider");
  }

  return context;
}
