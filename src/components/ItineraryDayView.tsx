import React, { useState } from 'react';
import { 
  TripDay, 
  ActivityItem, 
  ActivityCategory 
} from '../types/trip';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Footprints, 
  Train, 
  Car, 
  Bus,
  Utensils,
  Camera,
  Landmark,
  Trees,
  Coffee,
  Moon,
  ShoppingBag,
  Compass,
  ArrowUpDown,
  Lightbulb
} from 'lucide-react';

interface ItineraryDayViewProps {
  days: TripDay[];
  currency: string;
  onSwapActivity: (activity: ActivityItem, dayNumber: number) => void;
  onDeleteActivity: (activityId: string, dayNumber: number) => void;
  onAddCustomActivity: (dayNumber: number, activity: Partial<ActivityItem>) => void;
  onMoveActivity: (activityId: string, fromDay: number, toDay: number) => void;
}

export const ItineraryDayView: React.FC<ItineraryDayViewProps> = ({
  days,
  currency,
  onSwapActivity,
  onDeleteActivity,
  onAddCustomActivity,
  onMoveActivity,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStopTitle, setNewStopTitle] = useState('');
  const [newStopCategory, setNewStopCategory] = useState<ActivityCategory>('sightseeing');
  const [newStopLocation, setNewStopLocation] = useState('');
  const [newStopCost, setNewStopCost] = useState('0');
  const [newStopTime, setNewStopTime] = useState('02:00 PM');
  const [newStopTip, setNewStopTip] = useState('');

  const currentDay = days[activeDayIndex] || days[0];

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'dining':
        return <Utensils className="w-3.5 h-3.5 text-stone-600" />;
      case 'sightseeing':
        return <Camera className="w-3.5 h-3.5 text-stone-600" />;
      case 'culture':
        return <Landmark className="w-3.5 h-3.5 text-stone-600" />;
      case 'outdoor':
        return <Trees className="w-3.5 h-3.5 text-stone-600" />;
      case 'leisure':
        return <Coffee className="w-3.5 h-3.5 text-stone-600" />;
      case 'nightlife':
        return <Moon className="w-3.5 h-3.5 text-stone-600" />;
      case 'shopping':
        return <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  const getTransitIcon = (mode?: string) => {
    switch (mode) {
      case 'walk':
        return <Footprints className="w-3.5 h-3.5 text-stone-400" />;
      case 'metro':
      case 'train':
        return <Train className="w-3.5 h-3.5 text-stone-500" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-stone-500" />;
      case 'taxi':
        return <Car className="w-3.5 h-3.5 text-stone-500" />;
      default:
        return <Footprints className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  const getWeatherIcon = (iconName?: string) => {
    if (iconName?.includes('Rain')) return <CloudRain className="w-3.5 h-3.5 text-stone-500" />;
    if (iconName?.includes('Cloud')) return <CloudSun className="w-3.5 h-3.5 text-stone-500" />;
    return <Sun className="w-3.5 h-3.5 text-stone-500" />;
  };

  const handleAddStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopTitle.trim()) return;

    onAddCustomActivity(currentDay.dayNumber, {
      title: newStopTitle.trim(),
      category: newStopCategory,
      location: newStopLocation.trim() || 'Neighborhood spot',
      neighborhood: newStopLocation.trim().split(',')[0] || 'Central',
      estimatedCost: parseFloat(newStopCost) || 0,
      time: newStopTime,
      durationMinutes: 60,
      description: 'Custom activity added to itinerary.',
      proTip: newStopTip.trim() || 'Enjoy your visit!',
      coordinates: currentDay.activities[0]?.coordinates || { lat: 35.6762, lng: 139.6503 },
      isCustom: true,
    });

    setNewStopTitle('');
    setNewStopLocation('');
    setNewStopCost('0');
    setNewStopTip('');
    setIsAddingStop(false);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white border-stone-300 text-stone-900 shadow-xs'
                  : 'bg-stone-100/70 hover:bg-stone-100 border-stone-200/90 text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className={`text-xs font-bold ${isActive ? 'text-stone-900' : 'text-stone-600'}`}>
                  Day {day.dayNumber}
                </span>
                {day.weatherForecast && (
                  <span className="ml-auto flex items-center text-[10px] text-stone-400">
                    {getWeatherIcon(day.weatherForecast.icon)}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-stone-700 truncate max-w-[130px] mt-0.5">
                {day.title.replace(/^Day \d+:\s*/, '')}
              </span>
              <span className="text-[10px] text-stone-400 mt-1">
                {day.activities.length} stops · {currency} {day.dayEstimatedCost.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Header Card */}
      {currentDay && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span className="font-semibold text-stone-800">Day {currentDay.dayNumber}</span>
                <span className="text-stone-300">·</span>
                <span>{currentDay.theme}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {currentDay.title}
              </h2>
            </div>

            {/* Weather & Day Budget */}
            <div className="flex items-center gap-2.5">
              {currentDay.weatherForecast && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700">
                  {getWeatherIcon(currentDay.weatherForecast.icon)}
                  <span className="font-medium text-stone-900">{currentDay.weatherForecast.temp}</span>
                  <span className="text-stone-400 hidden md:inline">· {currentDay.weatherForecast.condition}</span>
                </div>
              )}
              <div className="px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                <span className="text-stone-500">Day est: </span>
                <span className="font-semibold text-stone-900">
                  {currency} {currentDay.dayEstimatedCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-2.5 sm:before:left-3.5 before:w-0.5 before:bg-stone-200">
            {currentDay.activities.map((activity, actIndex) => {
              return (
                <div key={activity.id} className="relative group">
                  {/* Timeline Node */}
                  <div className="absolute -left-[25px] sm:-left-[29px] top-4 w-5 h-5 rounded-full bg-white border-2 border-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-800 z-10 shadow-2xs">
                    {actIndex + 1}
                  </div>

                  {/* Transit Connector from previous */}
                  {activity.transitFromPrevious && (
                    <div className="mb-4 -mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[11px] text-stone-600">
                      {getTransitIcon(activity.transitFromPrevious.mode)}
                      <span className="capitalize font-medium text-stone-800">
                        {activity.transitFromPrevious.mode} ({activity.transitFromPrevious.durationMinutes} min)
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="truncate max-w-xs text-stone-500">{activity.transitFromPrevious.instructions}</span>
                    </div>
                  )}

                  {/* Activity Card */}
                  <div className="bg-white hover:bg-stone-50/60 border border-stone-200 rounded-xl p-4 sm:p-5 transition shadow-2xs">
                    {/* Top Row: Time, Category & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                          <Clock className="w-3 h-3 text-stone-500" />
                          {activity.time}
                        </span>
                        <span className="flex items-center gap-1 text-stone-500">
                          {getCategoryIcon(activity.category)}
                          <span className="capitalize">{activity.category}</span>
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="text-stone-500">{activity.durationMinutes} mins</span>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Swap Activity Button */}
                        <button
                          onClick={() => onSwapActivity(activity, currentDay.dayNumber)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-xs font-medium border border-stone-200 transition cursor-pointer"
                          title="Generate 3 tailored alternatives for this stop"
                        >
                          <RefreshCw className="w-3 h-3 text-stone-500" />
                          <span>Swap</span>
                        </button>

                        {/* Move Day dropdown */}
                        <div className="relative group/move">
                          <button
                            className="p-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-900 transition cursor-pointer"
                            title="Move to another day"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 hidden group-hover/move:flex flex-col bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-30 min-w-[120px]">
                            <span className="px-3 py-1 text-[10px] text-stone-400 uppercase font-semibold">Move to:</span>
                            {days.map((d) => (
                              <button
                                key={d.dayNumber}
                                disabled={d.dayNumber === currentDay.dayNumber}
                                onClick={() => onMoveActivity(activity.id, currentDay.dayNumber, d.dayNumber)}
                                className="px-3 py-1 text-left text-xs text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Day {d.dayNumber}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Delete Activity */}
                        <button
                          onClick={() => onDeleteActivity(activity.id, currentDay.dayNumber)}
                          className="p-1 rounded-lg bg-stone-50 hover:bg-rose-50 border border-stone-200 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Neighborhood */}
                    <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
                      <span>{activity.title}</span>
                      {activity.isCustom && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
                          Custom
                        </span>
                      )}
                    </h3>

                    {/* Location & Cost bar */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-2.5">
                      <span className="flex items-center gap-1 text-stone-700">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {activity.location}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-700 font-medium">
                        {activity.estimatedCost > 0 ? (
                          `${activity.currency} ${activity.estimatedCost.toLocaleString()} est.`
                        ) : (
                          'Free Entry'
                        )}
                      </span>
                      {activity.rating && (
                        <>
                          <span className="text-stone-300">·</span>
                          <span className="text-stone-700 font-medium">★ {activity.rating}</span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3">
                      {activity.description}
                    </p>

                    {/* Pro-Tip Callout */}
                    {activity.proTip && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-700">
                        <Lightbulb className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <strong className="text-stone-900 font-semibold">Insider Note: </strong>
                          <span className="text-stone-600">{activity.proTip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Custom Stop Button / Form */}
          <div className="mt-6 pt-4 border-t border-stone-100">
            {!isAddingStop ? (
              <button
                onClick={() => setIsAddingStop(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Stop to Day {currentDay.dayNumber}</span>
              </button>
            ) : (
              <form onSubmit={handleAddStopSubmit} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Add Stop to Day {currentDay.dayNumber}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingStop(false)}
                    className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Place / Activity Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Traditional Tea Tasting at Uji"
                      value={newStopTitle}
                      onChange={(e) => setNewStopTitle(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Category</label>
                    <select
                      value={newStopCategory}
                      onChange={(e) => setNewStopCategory(e.target.value as ActivityCategory)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    >
                      <option value="sightseeing">Sightseeing</option>
                      <option value="dining">Dining & Food</option>
                      <option value="culture">Culture & History</option>
                      <option value="outdoor">Outdoor & Nature</option>
                      <option value="leisure">Leisure & Relaxation</option>
                      <option value="nightlife">Nightlife & Drinks</option>
                      <option value="shopping">Shopping</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Time & Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 03:00 PM"
                      value={newStopTime}
                      onChange={(e) => setNewStopTime(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Estimated Cost ({currency})</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newStopCost}
                      onChange={(e) => setNewStopCost(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-stone-600 block mb-1">Address or Neighborhood</label>
                    <input
                      type="text"
                      placeholder="e.g. Ueno Park, Taito City"
                      value={newStopLocation}
                      onChange={(e) => setNewStopLocation(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-stone-600 block mb-1">Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Cash only, book tickets in advance"
                      value={newStopTip}
                      onChange={(e) => setNewStopTip(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingStop(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-200/70 text-xs text-stone-700 hover:bg-stone-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-white cursor-pointer"
                  >
                    Save Stop
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
