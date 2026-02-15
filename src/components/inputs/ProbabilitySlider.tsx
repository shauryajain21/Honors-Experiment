"use client";

import { useState, useEffect } from "react";

interface ProbabilitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
}

export default function ProbabilitySlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label = "Estimated probability of black balls",
  showValue = true,
}: ProbabilitySliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-base font-medium text-gray-900">
        {label}
      </label>

      <div className="flex items-center gap-4">
        {/* Min label */}
        <span className="text-sm text-gray-600 font-medium">{min}%</span>

        {/* Slider */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                     disabled:cursor-not-allowed disabled:opacity-50
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-nyu-purple
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:hover:bg-nyu-violet
                     [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-nyu-purple
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:hover:bg-nyu-violet
                     [&::-moz-range-thumb]:border-0"
            style={{
              background: `linear-gradient(to right, #57068C 0%, #57068C ${localValue}%, #e5e7eb ${localValue}%, #e5e7eb 100%)`,
            }}
          />
        </div>

        {/* Max label */}
        <span className="text-sm text-gray-600 font-medium">{max}%</span>
      </div>

      {/* Current value display */}
      {showValue && (
        <div className="text-center">
          <span className="inline-block bg-nyu-purple text-white px-4 py-2 rounded-lg font-bold text-lg">
            {localValue}%
          </span>
        </div>
      )}
    </div>
  );
}
