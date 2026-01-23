import React, { useState, useEffect } from 'react';
import { Input } from './Input';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value?: { min: number; max: number };
  onChange?: (value: { min: number; max: number }) => void;
  formatValue?: (value: number) => string;
  label?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  value = { min, max },
  onChange,
  formatValue = (v) => v.toString(),
  label
}) => {
  const [minValue, setMinValue] = useState(value.min);
  const [maxValue, setMaxValue] = useState(value.max);

  useEffect(() => {
    setMinValue(value.min);
    setMaxValue(value.max);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(newMin);
    onChange?.({ min: newMin, max: maxValue });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(newMax);
    onChange?.({ min: minValue, max: newMax });
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? min : Number(e.target.value);
    const newMin = Math.min(Math.max(val, min), maxValue - step);
    setMinValue(newMin);
    onChange?.({ min: newMin, max: maxValue });
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? max : Number(e.target.value);
    const newMax = Math.max(Math.min(val, max), minValue + step);
    setMaxValue(newMax);
    onChange?.({ min: minValue, max: newMax });
  };

  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-4">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      {/* Range Display */}
      <div className="flex items-center justify-between text-sm">
        <span>{formatValue(minValue)}</span>
        <span className="opacity-50">—</span>
        <span>{formatValue(maxValue)}</span>
      </div>

      {/* Dual Range Slider */}
      <div className="relative h-2">
        {/* Track */}
        <div className="absolute w-full h-2 bg-gray-200 rounded"></div>
        
        {/* Active Range */}
        <div
          className="absolute h-2 bg-primary rounded"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        ></div>

        {/* Min Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
        />

        {/* Max Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
        />
      </div>

      {/* Manual Input Fields */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min}
          max={maxValue - step}
          step={step}
          value={minValue}
          onChange={handleMinInputChange}
          placeholder="Min"
        />
        <span className="opacity-50">—</span>
        <Input
          type="number"
          min={minValue + step}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxInputChange}
          placeholder="Max"
        />
      </div>
    </div>
  );
};

export default RangeSlider;