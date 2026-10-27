import React from 'react';
import { X, History, Clock } from 'lucide-react';

interface AdjustmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history?: { timestamp: string; prompt: string; changeSummary: string }[];
}

export const AdjustmentHistoryModal: React.FC<AdjustmentHistoryModalProps> = ({
  isOpen,
  onClose,
  history = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 text-stone-900 shadow-xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Change History</h3>
            <p className="text-xs text-stone-500">Record of itinerary updates and adjustments</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
          {history.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-8">
              No modifications recorded yet. Use the Modify Schedule bar to adjust your trip.
            </p>
          ) : (
            history.map((entry, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="font-semibold text-stone-800">
                    Change #{history.length - idx}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    {entry.timestamp}
                  </span>
                </div>
                <div className="text-stone-700 mb-1">
                  <span className="text-stone-400">Request: </span>"{entry.prompt}"
                </div>
                <p className="text-stone-600 bg-white p-2 rounded-lg border border-stone-200 text-[11px] leading-relaxed">
                  {entry.changeSummary}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-stone-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
