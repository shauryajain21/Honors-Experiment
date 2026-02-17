"use client";

import { useState, useEffect } from "react";

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
}

export default function ConfidenceSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  disabled = false,
  label = "How confident are you in your estimate?",
  showValue = true,
}: ConfidenceSliderProps) {
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

      <div className="flex items-start gap-4">
        {/* Min label with "Least confident" */}
        <div className="text-center min-w-[80px] pt-1">
          <span className="text-sm text-gray-600 font-medium">{min}</span>
          <div className="text-xs text-gray-500">Least confident</div>
        </div>

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
                     [&::-webkit-slider-thumb]:bg-green-600
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:hover:bg-green-700
                     [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-green-600
                     [&::-moz-range-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:hover:bg-green-700
                     [&::-moz-range-thumb]:border-0"
            style={{
              background: `linear-gradient(to right, #16a34a 0%, #16a34a ${(localValue / max) * 100}%, #e5e7eb ${(localValue / max) * 100}%, #e5e7eb 100%)`,
            }}
          />

          {/* Tick marks */}
          <div className="flex justify-between px-2 mt-1">
            {Array.from({ length: max + 1 }, (_, i) => (
              <div key={i} className="w-px h-2 bg-gray-400" />
            ))}
          </div>
        </div>

        {/* Max label with "Most confident" */}
        <div className="text-center min-w-[80px] pt-1">
          <span className="text-sm text-gray-600 font-medium">{max}</span>
          <div className="text-xs text-gray-500">Most confident</div>
        </div>
      </div>

      {/* Current value display */}
      {showValue && (
        <div className="text-center">
          <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
            {localValue} / {max}
          </div>
        </div>
      )}
    </div>
  );
}
