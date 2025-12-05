import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = "default",
  className,
  style,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400":
            variant === "default",
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300":
            variant === "secondary",
          "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300":
            variant === "outline",
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400":
            variant === "destructive",
        },
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}



