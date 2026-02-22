import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Settings, Cpu, Leaf, Zap, Wrench, Activity, Database, FileText } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeStrategy: string;
  onStrategyChange: (strategy: string) => void;
}

const strategies = [
  { name: 'Heavy Duty', icon: Wrench, color: 'text-orange-500' },
  { name: 'Gasoline', icon: Zap, color: 'text-red-500' },
  { name: 'Diesel', icon: Activity, color: 'text-blue-500' },
  { name: 'Eco', icon: Leaf, color: 'text-emerald-500' },
  { name: 'Manual', icon: Settings, color: 'text-slate-400' },
];

export function Sidebar({ activeStrategy, onStrategyChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">ECU Engine</h1>
          <p className="text-xs text-slate-400 font-mono">v2.0.0-rc</p>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-8">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
            Tuning Strategies
          </h2>
          <nav className="flex flex-col gap-1">
            {strategies.map((strategy) => {
              const Icon = strategy.icon;
              const isActive = activeStrategy === strategy.name;
              return (
                <button
                  key={strategy.name}
                  onClick={() => onStrategyChange(strategy.name)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-slate-800 text-slate-100 shadow-sm" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? strategy.color : "text-slate-500")} />
                  {strategy.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
            Tools
          </h2>
          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200">
              <Database className="w-4 h-4 text-slate-500" />
              Firmware DB
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200">
              <FileText className="w-4 h-4 text-slate-500" />
              Map Definitions
            </button>
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Brain Connected</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">0ms</span>
        </div>
      </div>
    </aside>
  );
}
