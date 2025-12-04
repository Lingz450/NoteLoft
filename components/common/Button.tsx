'use client';

import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        solid: "bg-[var(--accent)] text-white shadow-card",
        outline: "border-2 border-[var(--border)] bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700",
        ghost: "text-[var(--text)] hover:bg-slate-100",
      },
      size: {
        sm: "px-4 py-2",
        md: "px-4 py-2.5",
        lg: "px-5 py-3",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={clsx(buttonStyles({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
