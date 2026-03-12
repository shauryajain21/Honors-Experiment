"use client";

import { useState, useEffect } from "react";

interface ProbabilityInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export default function ProbabilityInput({
  value,
  onChange,
  disabled = false,
  label = "What is your estimate about the probability of black balls in this jar?",
}: ProbabilityInputProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [textValue, setTextValue] = useState("");
  const [interacted, setInteracted] = useState(false);

  // Sync slider and text when either changes
  useEffect(() => {
    if (value !== null) {
      setSliderValue(value);
      setTextValue(String(value));
    }
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValue(val);
    setTextValue(String(val));
    setInteracted(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextValue(raw);
    const num = Number(raw);
    if (raw !== "" && !isNaN(num) && num >= 0 && num <= 100 && Number.isInteger(num)) {
      setSliderValue(num);
      setInteracted(true);
    }
  };

  const handleSubmit = () => {
    if (!interacted) return;
    const num = Number(textValue);
    if (!isNaN(num) && num >= 0 && num <= 100 && Number.isInteger(num)) {
      onChange(num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-4">
      {label && (
        <label className="block text-lg font-medium text-gray-700 text-center">
          {label}
        </label>
      )}

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderValue}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-nyu-purple"
        />
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Text input + Submit */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Or type your estimate:</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={textValue}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="0–100"
            className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:border-nyu-purple text-gray-900"
          />
          <span className="text-lg font-semibold text-gray-700">%</span>
        </div>
      </div>

      {/* Submit button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={disabled || !interacted}
          className="bg-nyu-purple hover:bg-nyu-violet text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Estimate
        </button>
        {!interacted && (
          <p className="text-sm text-red-500 mt-2">
            Please use the slider or type a value before confirming
          </p>
        )}
      </div>
    </div>
  );
}
