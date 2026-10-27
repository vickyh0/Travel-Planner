import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../types/trip';
import { X, RefreshCw, Check, Clock, Lightbulb, Loader2 } from 'lucide-react';

interface SwapActivityModalProps {
  activity: ActivityItem | null;
  dayNumber: number;
  destination: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwap: (oldActivityId: string, newActivity: ActivityItem, dayNumber: number) => void;
}

export const SwapActivityModal: React.FC<SwapActivityModalProps> = ({
  activity,
  dayNumber,
  destination,
  isOpen,
  onClose,
  onConfirmSwap,
}) => {
  const [alternatives, setAlternatives] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlt, setSelectedAlt] = useState<ActivityItem | null>(null);

  useEffect(() => {
    if (isOpen && activity) {
      fetchAlternatives();
    }
  }, [isOpen, activity]);

  const fetchAlternatives = async () => {
    if (!activity) return;
    setIsLoading(true);
    setSelectedAlt(null);

    try {
      const res = await fetch('/api/swap-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: activity,
          destination: destination,
          neighborhood: activity.neighborhood,
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch swap alternatives');
      const data = await res.json();
      setAlternatives(data.alternatives || []);
    } catch (err) {
      console.error('Error in swap modal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !activity) return null;

  const handleApply = () => {
    if (!selectedAlt) return;
    onConfirmSwap(activity.id, selectedAlt, dayNumber);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full p-6 text-stone-900 shadow-xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Alternative Options</h3>
              <p className="text-xs text-stone-500">
                Replacements in {activity.neighborhood || destination} for Day {dayNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Activity Reference */}
        <div className="my-4 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider block mb-1">
            Currently Scheduled
          </span>
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-stone-900">{activity.title}</span>
              <span className="text-stone-500 block mt-0.5">{activity.location} · {activity.time}</span>
            </div>
            <span className="text-stone-800 font-medium">
              {activity.estimatedCost > 0 ? `${activity.currency} ${activity.estimatedCost.toLocaleString()}` : 'Free'}
            </span>
          </div>
        </div>

        {/* Alternatives List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1 scrollbar-thin">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Select an alternative:
            </span>
            <button
              onClick={fetchAlternatives}
              disabled={isLoading}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>More choices</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
              <p className="text-xs">Finding nearby alternatives...</p>
            </div>
          ) : (
            alternatives.map((alt) => {
              const isSelected = selectedAlt?.id === alt.id;
              return (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlt(alt)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-stone-50 border-stone-800 text-stone-900 shadow-xs'
                      : 'bg-white hover:bg-stone-50/70 border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold capitalize text-stone-800">
                        {alt.category}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-500">{alt.durationMinutes || 60} mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-stone-700">
                        {alt.estimatedCost > 0 ? `${alt.currency || activity.currency} ${alt.estimatedCost.toLocaleString()}` : 'Free'}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 mb-1">{alt.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2.5">{alt.description}</p>

                  {alt.proTip && (
                    <div className="flex items-start gap-1.5 text-[11px] text-stone-600 bg-stone-100/70 p-2 rounded-lg border border-stone-200/80">
                      <Lightbulb className="w-3 h-3 text-stone-500 shrink-0 mt-0.5" />
                      <span>{alt.proTip}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {selectedAlt ? '1 alternative selected' : 'Choose an option above'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-xs font-medium text-stone-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedAlt}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Replace Stop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
