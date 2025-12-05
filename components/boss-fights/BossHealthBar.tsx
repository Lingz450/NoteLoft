"use client";

/**
 * BossHealthBar Component
 * 
 * Visual HP bar for boss fights.
 */

import { Shield, Skull, Trophy } from "lucide-react";
import { getBossFlavorText } from "@/lib/services/boss-fight-calculator";

interface BossHealthBarProps {
  name: string;
  currentHP: number;
  maxHP: number;
  status: string;
  difficulty: string;
}

export function BossHealthBar({ name, currentHP, maxHP, status, difficulty }: BossHealthBarProps) {
  const hpPercent = (currentHP / maxHP) * 100;

  const difficultyColors = {
    EASY: "from-green-500 to-emerald-500",
    NORMAL: "from-blue-500 to-cyan-500",
    HARD: "from-orange-500 to-red-500",
    NIGHTMARE: "from-purple-600 to-red-600",
  };

  const gradient = difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.NORMAL;

  const statusIcons = {
    ALIVE: Shield,
    DEFEATED: Trophy,
    ESCAPED: Skull,
  };

  const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Shield;
  const flavorText = getBossFlavorText(status, currentHP, maxHP);

  return (
    <div className="space-y-3">
      {/* Boss Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}>
            <StatusIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {difficulty} BOSS
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {currentHP}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            / {maxHP} HP
          </p>
        </div>
      </div>

      {/* HP Bar */}
      <div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-700">
          <div
            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 flex items-center justify-end px-2`}
            style={{ width: `${Math.max(hpPercent, 3)}%` }}
          >
            {hpPercent > 20 && (
              <span className="text-xs font-bold text-white">
                {Math.round(hpPercent)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Flavor Text */}
      <p className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        {flavorText}
      </p>
    </div>
  );
}

