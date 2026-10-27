import React from 'react';
import { Compass, Clock, Bookmark, Download, Plus, MapPin } from 'lucide-react';
import { Itinerary } from '../types/trip';

interface HeaderProps {
  currentTrip: Itinerary | null;
  savedTripsCount: number;
  onOpenNewTripModal: () => void;
  onOpenSavedTrips: () => void;
  onOpenExportModal: () => void;
  onToggleEfficiencyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrip,
  savedTripsCount,
  onOpenNewTripModal,
  onOpenSavedTrips,
  onOpenExportModal,
  onToggleEfficiencyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-4.5 h-4.5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-stone-900">Voyage</span>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
                · Travel Planner
              </span>
            </div>
            {currentTrip && (
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span className="font-medium text-stone-700">{currentTrip.destination}</span>
                <span className="text-stone-300">·</span>
                <span>{currentTrip.days.length} Days</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Efficiency Metric Pill */}
          <button
            onClick={onToggleEfficiencyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200/90 text-stone-700 text-xs font-medium transition cursor-pointer"
            title="View Route & Time Efficiency Analytics"
          >
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Efficiency</span>
            <span className="text-stone-900 font-semibold text-[11px]">
              +40% Faster
            </span>
          </button>

          {/* Saved Trips */}
          <button
            onClick={onOpenSavedTrips}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Saved</span>
            {savedTripsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold border border-stone-200">
                {savedTripsCount}
              </span>
            )}
          </button>

          {/* Export */}
          {currentTrip && (
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer shadow-xs"
              title="Export to Calendar (.ics), PDF, or Markdown"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* New Plan Button */}
          <button
            onClick={onOpenNewTripModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};
