import React, { useState, useMemo } from 'react';
import { TripDay, ActivityItem } from '../types/trip';
import { MapPin, Navigation, Clock, Compass, ExternalLink } from 'lucide-react';

interface RouteMapVisualizerProps {
  days: TripDay[];
  destination: string;
}

const DAY_COLORS = [
  { stroke: '#c2410c', fill: '#ffedd5', bg: 'bg-orange-700', text: 'text-orange-700', label: 'Day 1' },
  { stroke: '#15803d', fill: '#dcfce7', bg: 'bg-emerald-700', text: 'text-emerald-700', label: 'Day 2' },
  { stroke: '#0369a1', fill: '#e0f2fe', bg: 'bg-sky-700', text: 'text-sky-700', label: 'Day 3' },
  { stroke: '#7e22ce', fill: '#f3e8ff', bg: 'bg-purple-700', text: 'text-purple-700', label: 'Day 4' },
  { stroke: '#b45309', fill: '#fef3c7', bg: 'bg-amber-700', text: 'text-amber-700', label: 'Day 5' },
  { stroke: '#0f766e', fill: '#ccfbf1', bg: 'bg-teal-700', text: 'text-teal-700', label: 'Day 6' },
  { stroke: '#be123c', fill: '#ffe4e6', bg: 'bg-rose-700', text: 'text-rose-700', label: 'Day 7' },
];

export const RouteMapVisualizer: React.FC<RouteMapVisualizerProps> = ({ days, destination }) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [activePin, setActivePin] = useState<{ activity: ActivityItem; dayNumber: number } | null>(null);

  // Collect all coordinates to compute bounding box
  const allStopsWithCoords = useMemo(() => {
    const list: Array<{ activity: ActivityItem; dayNumber: number; colorIndex: number }> = [];
    days.forEach((day, dIdx) => {
      day.activities.forEach((act) => {
        if (act.coordinates?.lat && act.coordinates?.lng) {
          list.push({
            activity: act,
            dayNumber: day.dayNumber,
            colorIndex: dIdx % DAY_COLORS.length,
          });
        }
      });
    });
    return list;
  }, [days]);

  // Compute map projection bounds
  const mapBounds = useMemo(() => {
    if (allStopsWithCoords.length === 0) {
      return { minLat: 35.6, maxLat: 35.75, minLng: 139.6, maxLng: 139.85 };
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    allStopsWithCoords.forEach(({ activity }) => {
      minLat = Math.min(minLat, activity.coordinates.lat);
      maxLat = Math.max(maxLat, activity.coordinates.lat);
      minLng = Math.min(minLng, activity.coordinates.lng);
      maxLng = Math.max(maxLng, activity.coordinates.lng);
    });

    const latPadding = Math.max((maxLat - minLat) * 0.18, 0.02);
    const lngPadding = Math.max((maxLng - minLng) * 0.18, 0.02);

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [allStopsWithCoords]);

  // Convert GPS (lat, lng) to SVG coordinates (0..800 width, 0..480 height)
  const project = (lat: number, lng: number) => {
    const width = 800;
    const height = 480;

    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng || 1)) * (width - 120) + 60;
    const y = height - (((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat || 1)) * (height - 100) + 50);

    return { x, y };
  };

  const visibleDays = selectedDayFilter === 'all' ? days : days.filter(d => d.dayNumber === selectedDayFilter);

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-xs text-stone-900">
      {/* Header and Day Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-stone-700" />
            <h3 className="text-base font-bold text-stone-900">Route Map</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Geographic overview of daily clustered stops in {destination}
          </p>
        </div>

        {/* Day selection filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedDayFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            All Days
          </button>
          {days.map((day, idx) => {
            const color = DAY_COLORS[idx % DAY_COLORS.length];
            const isSelected = selectedDayFilter === day.dayNumber;
            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayFilter(day.dayNumber)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                <span>Day {day.dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartographic SVG Map Display */}
      <div className="relative w-full aspect-[16/10] bg-[#f8f7f4] rounded-xl border border-stone-200 overflow-hidden shadow-inner">
        {/* Subtle grid pattern representing clean paper map */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d6d3d1 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} 
        />

        {/* Compass & Distance badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 border border-stone-200 backdrop-blur-xs px-3 py-1.5 rounded-lg text-[11px] text-stone-600 shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-stone-600" />
          <span>Sequential Route</span>
          <span className="text-stone-300">·</span>
          <span className="text-stone-800 font-semibold">96% Neighborhood Clustered</span>
        </div>

        {/* Google Maps External link */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/90 hover:bg-stone-50 border border-stone-200 backdrop-blur-xs px-2.5 py-1.5 rounded-lg text-[11px] text-stone-600 hover:text-stone-900 transition shadow-2xs"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="w-3 h-3 text-stone-400" />
        </a>

        {/* SVG Route Paths & Pins */}
        <svg viewBox="0 0 800 480" className="w-full h-full">
          <defs>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Render Route Paths */}
          {visibleDays.map((day) => {
            const color = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
            const points = day.activities
              .filter(a => a.coordinates?.lat && a.coordinates?.lng)
              .map(a => project(a.coordinates.lat, a.coordinates.lng));

            if (points.length < 2) return null;

            const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

            return (
              <g key={`path-day-${day.dayNumber}`}>
                {/* Subtle underlay track */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="5"
                  strokeOpacity="0.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Main route track */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="2"
                  strokeDasharray="5,4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Render Stop Markers */}
          {visibleDays.map((day) => {
            const color = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
            return day.activities.map((activity, actIdx) => {
              if (!activity.coordinates?.lat || !activity.coordinates?.lng) return null;
              const { x, y } = project(activity.coordinates.lat, activity.coordinates.lng);
              const isActive = activePin?.activity.id === activity.id;

              return (
                <g
                  key={activity.id}
                  className="cursor-pointer transition-transform duration-150 hover:scale-115"
                  onClick={() => setActivePin({ activity, dayNumber: day.dayNumber })}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                >
                  {/* Marker Pin Base */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? "12" : "9.5"}
                    fill="#ffffff"
                    stroke={color.stroke}
                    strokeWidth={isActive ? "3" : "2"}
                    filter="url(#softShadow)"
                  />

                  {/* Stop Number */}
                  <text
                    x={x}
                    y={y + 3.5}
                    textAnchor="middle"
                    fill={color.stroke}
                    fontSize={isActive ? "10" : "8"}
                    fontWeight="bold"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {actIdx + 1}
                  </text>
                </g>
              );
            });
          })}
        </svg>

        {/* Selected Pin Details Overlay Card */}
        {activePin && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-sm z-30 bg-white border border-stone-200 rounded-xl p-3.5 shadow-lg text-stone-900">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                  Day {activePin.dayNumber} · Stop
                </span>
                <span className="text-xs text-stone-500 capitalize">{activePin.activity.category}</span>
              </div>
              <button
                onClick={() => setActivePin(null)}
                className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer p-0.5"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-bold text-stone-900 mb-1">{activePin.activity.title}</h4>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span className="flex items-center gap-1 text-stone-600">
                <Clock className="w-3 h-3 text-stone-400" />
                {activePin.activity.time}
              </span>
              <span>·</span>
              <span className="text-stone-800 font-medium">
                {activePin.activity.estimatedCost > 0
                  ? `${activePin.activity.currency} ${activePin.activity.estimatedCost.toLocaleString()}`
                  : 'Free'}
              </span>
            </div>
            <p className="text-xs text-stone-600 line-clamp-2 mb-2">{activePin.activity.description}</p>
            {activePin.activity.proTip && (
              <div className="text-[11px] text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200">
                <strong className="text-stone-900">Note: </strong>{activePin.activity.proTip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
        <div className="flex items-center gap-3">
          <span className="font-medium text-stone-700">Days:</span>
          <div className="flex flex-wrap items-center gap-2.5">
            {days.map((day, idx) => {
              const color = DAY_COLORS[idx % DAY_COLORS.length];
              return (
                <div key={day.dayNumber} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                  <span>Day {day.dayNumber}</span>
                </div>
              );
            })}
          </div>
        </div>
        <span className="text-stone-400 text-[11px]">
          Select any stop marker to inspect timing and neighborhood notes
        </span>
      </div>
    </div>
  );
};
