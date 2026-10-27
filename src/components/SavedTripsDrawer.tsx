import React from 'react';
import { Itinerary } from '../types/trip';
import { X, MapPin, Trash2, ArrowRight, Bookmark } from 'lucide-react';

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: Itinerary[];
  currentTripId: string;
  onSelectTrip: (trip: Itinerary) => void;
  onDeleteTrip: (tripId: string) => void;
  onLoadPreset: (presetKey: string) => void;
}

export const SavedTripsDrawer: React.FC<SavedTripsDrawerProps> = ({
  isOpen,
  onClose,
  savedTrips,
  currentTripId,
  onSelectTrip,
  onDeleteTrip,
  onLoadPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white border-l border-stone-200 w-full max-w-md h-full flex flex-col p-6 text-stone-900 shadow-xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="text-base font-bold text-stone-900">Saved Itineraries</h3>
              <p className="text-xs text-stone-500">{savedTrips.length} itineraries stored</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Trips List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
          {savedTrips.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No saved trips yet. Plans you create or customize will appear here.</p>
            </div>
          ) : (
            savedTrips.map((trip) => {
              const isCurrent = trip.id === currentTripId;
              return (
                <div
                  key={trip.id}
                  className={`p-4 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-stone-50 border-stone-800 text-stone-900'
                      : 'bg-white hover:bg-stone-50/70 border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-stone-800 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{trip.destination}, {trip.country}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold uppercase bg-stone-900 text-white px-2 py-0.5 rounded">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => onDeleteTrip(trip.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition"
                        title="Delete itinerary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 mb-1 line-clamp-1">{trip.title}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-3">{trip.summary}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                    <span className="text-stone-400">{trip.days.length} Days · {trip.preferences?.travelStyle || 'Balanced'}</span>
                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSelectTrip(trip);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-stone-800 hover:text-stone-900 font-semibold cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Preset showcases */}
          <div className="pt-4 mt-6 border-t border-stone-100">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
              Sample Trips
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onLoadPreset('tokyo');
                  onClose();
                }}
                className="w-full p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left text-xs transition cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-stone-900 block">Tokyo 4-Day Cultural & Culinary</span>
                  <span className="text-stone-500 text-[11px]">Asakusa, Shibuya, teamLab, Shinjuku</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => {
                  onLoadPreset('paris');
                  onClose();
                }}
                className="w-full p-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left text-xs transition cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-stone-900 block">Paris 3-Day Art & Pastry</span>
                  <span className="text-stone-500 text-[11px]">Le Marais, Musée d'Orsay, Canal Saint-Martin</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
