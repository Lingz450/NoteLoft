"use client";

interface GpaCardProps {
  gpa?: number;
  maxGpa?: number;
}

export function GpaCard({ gpa = 3.52, maxGpa = 4.0 }: GpaCardProps) {
  const percentage = (gpa / maxGpa) * 100;
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">Overall GPA</h2>
      <p className="text-xs text-muted-foreground">Estimated GPA this semester</p>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative h-32 w-32">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gpaGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percentage / 100)}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="gpaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.62 0.214 265)" />
                <stop offset="100%" stopColor="oklch(0.68 0.18 265)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground tabular-nums">{gpa.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">/ {maxGpa.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

