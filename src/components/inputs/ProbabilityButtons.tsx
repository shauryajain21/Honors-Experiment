"use client";

interface ProbabilityButtonsProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

const PERCENTAGES = Array.from({ length: 21 }, (_, i) => i * 5);

export default function ProbabilityButtons({
  value,
  onChange,
  disabled = false,
  label = "What is your estimate about the probability of black balls in this jar?",
}: ProbabilityButtonsProps) {
  return (
    <div className="w-full space-y-3">
      {label && (
        <label className="block text-lg font-medium text-gray-700 text-center">
          {label}
        </label>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {PERCENTAGES.map((pct) => (
          <button
            key={pct}
            onClick={() => onChange(pct)}
            disabled={disabled}
            className={`
              px-3 py-2 rounded-lg text-sm font-semibold transition-all min-w-[52px]
              ${
                value === pct
                  ? "bg-nyu-purple text-white ring-2 ring-nyu-violet scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:ring-1 hover:ring-gray-300"
              }
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            {pct}%
          </button>
        ))}
      </div>

      {value !== null && (
        <div className="text-center">
          <span className="inline-block bg-nyu-purple text-white px-4 py-2 rounded-lg font-bold text-lg">
            {value}%
          </span>
        </div>
      )}
    </div>
  );
}
