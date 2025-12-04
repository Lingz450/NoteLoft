"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ToastProvider } from "@/components/common/ToastProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { UserPreferencesProvider } from "@/components/common/UserPreferencesProvider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserPreferencesProvider>
          <ToastProvider>{children}</ToastProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
