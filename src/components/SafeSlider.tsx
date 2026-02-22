import React, { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SafeSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  strategy: string;
  min?: number;
  max?: number;
}

export function SafeSlider({ label, value, onChange, strategy, min = 0, max = 200 }: SafeSliderProps) {
  const [riskScore, setRiskScore] = useState(0);
  const [hardLimit, setHardLimit] = useState(max);
  const [isSafe, setIsSafe] = useState(true);

  useEffect(() => {
    const fetchSafeLimit = async () => {
      try {
        const res = await fetch(`/api/safe-limit?current_value=${value}&strategy=${encodeURIComponent(strategy)}`);
        if (res.ok) {
          const data = await res.json();
          setRiskScore(data.risk_score);
          setHardLimit(data.hard_limit);
          setIsSafe(data.is_safe);
        }
      } catch (error) {
        console.error('Failed to fetch safe limit:', error);
      }
    };

    const timeoutId = setTimeout(fetchSafeLimit, 300);
    return () => clearTimeout(timeoutId);
  }, [value, strategy]);

  // Calculate color based on risk score (0 = green, 50 = yellow, 100 = red)
  const getSliderColor = () => {
    if (!isSafe) return 'bg-red-600';
    if (riskScore < 30) return 'bg-emerald-500';
    if (riskScore < 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    // Hard limit enforcement
    if (newValue <= hardLimit) {
      onChange(newValue);
    } else {
      onChange(hardLimit);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-3">
          <span className={cn("text-xs px-2 py-1 rounded-full font-mono", isSafe ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
            {isSafe ? 'SAFE' : 'LIMIT REACHED'}
          </span>
          <span className="text-sm font-mono text-slate-100 w-12 text-right">{value.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("absolute top-0 left-0 h-full transition-all duration-300 ease-out", getSliderColor())}
          style={{ width: \`\${((value - min) / (max - min)) * 100}%\` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={0.1}
          value={value}
          onChange={handleSliderChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
        <span>Min: {min}</span>
        <span>Risk: {riskScore.toFixed(0)}%</span>
        <span>Limit: {hardLimit.toFixed(1)}</span>
      </div>
    </div>
  );
}
