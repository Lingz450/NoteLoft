"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type SidebarPosition = "left" | "right";

type UserPreferencesContextValue = {
  sidebarPosition: SidebarPosition;
  setSidebarPosition: (position: SidebarPosition) => void;
};

const STORAGE_KEY = "noteloft.sidebarPosition";

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [sidebarPosition, setSidebarPositionState] = useState<SidebarPosition>("left");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "left" || stored === "right") {
        setSidebarPositionState(stored);
      }
    } catch {
      // ignore read errors
    }
  }, []);

  const setSidebarPosition = (position: SidebarPosition) => {
    setSidebarPositionState(position);
    try {
      localStorage.setItem(STORAGE_KEY, position);
    } catch {
      // ignore write errors
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ sidebarPosition, setSidebarPosition }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useSidebarPosition(): [SidebarPosition, (position: SidebarPosition) => void] {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useSidebarPosition must be used within a UserPreferencesProvider");
  }
  return [context.sidebarPosition, context.setSidebarPosition];
}

