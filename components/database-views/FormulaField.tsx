"use client";

/**
 * FormulaField Component
 * 
 * Display computed formula values in database views.
 */

import { useMemo } from "react";
import { Calculator } from "lucide-react";
import { evaluateFormula, formatFormulaResult, Formula } from "@/lib/services/rollups";

interface FormulaFieldProps {
  formula: Formula;
  rowData: Record<string, any>;
  label?: string;
}

export function FormulaField({ formula, rowData, label }: FormulaFieldProps) {
  const result = useMemo(() => {
    return evaluateFormula(formula, rowData);
  }, [formula, rowData]);

  const formatted = formatFormulaResult(result, formula);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Calculator className="w-4 h-4 text-gray-500" />
      {label && (
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {label}:
        </span>
      )}
      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
        {formatted}
      </span>
    </div>
  );
}

