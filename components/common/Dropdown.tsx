'use client';

import { ReactNode, useState } from "react";
import clsx from "clsx";

type Option<T> = {
  label: string;
  value: T;
};

type Props<T> = {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (val: T) => void;
};

export function Dropdown<T>({ label, options, value, onChange }: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setOpen((p) => !p)}
        type="button"
      >
        {label && <span className="font-bold text-gray-600 dark:text-gray-400">{label}</span>}
        <span className="font-semibold text-gray-900 dark:text-white">{selected?.label ?? "Select"}</span>
        <span className="text-gray-500 dark:text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-48 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              className={clsx(
                "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                opt.value === value && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold"
              )}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
