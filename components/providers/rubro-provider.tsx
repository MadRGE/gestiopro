"use client";

import { createContext, useContext } from "react";
import type { RubroLabels } from "@/lib/rubro-config";

interface RubroContextValue {
  labels: RubroLabels;
  rubroNombre: string;
}

const RubroContext = createContext<RubroContextValue | null>(null);

interface RubroProviderProps {
  labels: RubroLabels;
  rubroNombre: string;
  children: React.ReactNode;
}

export function RubroProvider({ labels, rubroNombre, children }: RubroProviderProps) {
  return (
    <RubroContext.Provider value={{ labels, rubroNombre }}>
      {children}
    </RubroContext.Provider>
  );
}

export function useRubro(): RubroContextValue {
  const ctx = useContext(RubroContext);
  if (!ctx) {
    throw new Error("useRubro must be used within a RubroProvider");
  }
  return ctx;
}
