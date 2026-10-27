import React, { useState } from 'react';
import { SlidersHorizontal, ArrowRight, Loader2, History, CloudRain, DollarSign, Coffee, UtensilsCrossed, Moon, Smile } from 'lucide-react';

interface RealtimeAdjustmentBarProps {
  onAdjust: (prompt: string) => Promise<void>;
  isLoading: boolean;
  adjustmentHistoryCount: number;
  onOpenHistory: () => void;
  lastAdjustmentMessage?: string;
}

export const RealtimeAdjustmentBar: React.FC<RealtimeAdjustmentBarProps> = ({
  onAdjust,
  isLoading,
  adjustmentHistoryCount,
  onOpenHistory,
  lastAdjustmentMessage,
}) => {
  const [prompt, setPrompt] = useState('');

  const QUICK_PRESETS = [
    { label: 'Rainy Day', icon: CloudRain, prompt: 'Adapt the itinerary for a rainy day: swap open-air walks with indoor museums, covered shopping passages, and cozy cafes' },
    { label: 'Reduce Budget (25%)', icon: DollarSign, prompt: 'Make the trip 25% more budget-friendly by recommending local street food stands and free scenic viewpoints' },
    { label: 'Relaxed Pace', icon: Coffee, prompt: 'Slow down the pace: remove rushed stops, schedule relaxed morning coffee breaks, and allow leisurely afternoon rests' },
    { label: 'Local Food Focus', icon: UtensilsCrossed, prompt: 'Elevate culinary focus: include iconic regional street snacks, dessert spots, and authentic neighborhood eateries' },
    { label: 'Evening Nightlife', icon: Moon, prompt: 'Add evening nightlife options including rooftop cocktail bars, speakeasies, and illuminated night walks' },
    { label: 'Family Friendly', icon: Smile, prompt: 'Adjust all stops to be family-friendly with interactive exhibits, easy walking distances, and kid-approved dining' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    const text = prompt;
    setPrompt('');
    await onAdjust(text);
  };

  const handleSelectPreset = async (presetPrompt: string) => {
    if (isLoading) return;
    await onAdjust(presetPrompt);
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs text-stone-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Modify Schedule
            </h3>
            <p className="text-xs text-stone-500">
              Request real-time schedule adjustments for weather, budget, pacing, or dining.
            </p>
          </div>
        </div>

        {adjustmentHistoryCount > 0 && (
          <button
            onClick={onOpenHistory}
            className="self-start md:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-stone-400" />
            <span>Changes ({adjustmentHistoryCount})</span>
          </button>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Type a change: 'It’s raining tomorrow', 'Vegetarian food only', 'Start day at 11 AM'..."
            className="w-full bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition shadow-2xs"
          />
        </div>
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
              <span className="hidden sm:inline">Updating...</span>
            </>
          ) : (
            <>
              <span>Update</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick 1-click preset pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
          Presets:
        </span>
        {QUICK_PRESETS.map((preset, index) => {
          const Icon = preset.icon;
          return (
            <button
              key={index}
              onClick={() => handleSelectPreset(preset.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-stone-600 hover:text-stone-900 text-xs whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-stone-500" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Last adjustment applied banner */}
      {lastAdjustmentMessage && !isLoading && (
        <div className="mt-3 pt-3 border-t border-stone-200/80 text-xs text-stone-700 bg-stone-50 -mx-4 -mb-4 p-3 rounded-b-2xl flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-600 mt-1.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-stone-900">Update applied: </span>
            <span className="text-stone-600">{lastAdjustmentMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
