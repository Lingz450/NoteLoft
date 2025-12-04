"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Load theme from localStorage
    const saved = localStorage.getItem('noteloft-theme');
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      setThemeState(saved as Theme);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      let effectiveTheme: "light" | "dark" = "light";

      if (theme === "system") {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
      } else {
        effectiveTheme = theme;
      }

      setResolvedTheme(effectiveTheme);

      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('noteloft-theme', newTheme);
    
    // Also update settings if they exist
    const settings = localStorage.getItem('noteloft-settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        parsed.appearance = parsed.appearance || {};
        parsed.appearance.theme = newTheme;
        localStorage.setItem('noteloft-settings', JSON.stringify(parsed));
      } catch (e) {
        // Ignore
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

