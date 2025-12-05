"use client";

/**
 * CrisisBanner Component
 * 
 * Displays crisis mode banner at top of dashboard.
 */

import { AlertCircle, X } from "lucide-react";

interface CrisisBannerProps {
  daysRemaining: number;
  onDeactivate: () => void;
}

export function CrisisBanner({ daysRemaining, onDeactivate }: CrisisBannerProps) {
  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg animate-pulse">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">🔥 Crisis Mode Active</h3>
            <p className="text-sm opacity-90">
              Focus mode enabled · Showing only urgent items · {daysRemaining} days remaining
            </p>
          </div>
        </div>
        <button
          onClick={onDeactivate}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Deactivate crisis mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

