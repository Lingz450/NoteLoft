import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-[0_25px_60px_-35px_rgba(15,23,42,0.55)]",
        className
      )}
    >
      {children}
    </div>
  );
}


