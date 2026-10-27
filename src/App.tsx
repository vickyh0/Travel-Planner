import React, { useState, useEffect } from 'react';
import { Itinerary, TripPreferences, ActivityItem } from './types/trip';
import { INITIAL_TOKYO_TRIP } from './data/sampleTrips';
import { Header } from './components/Header';
import { EfficiencyBanner } from './components/EfficiencyBanner';
import { RealtimeAdjustmentBar } from './components/RealtimeAdjustmentBar';
import { ItineraryDayView } from './components/ItineraryDayView';
import { RouteMapVisualizer } from './components/RouteMapVisualizer';
import { BudgetTracker } from './components/BudgetTracker';
import { PackingChecklist } from './components/PackingChecklist';
import { LocalGuide } from './components/LocalGuide';
import { TripBuilderModal } from './components/TripBuilderModal';
import { SwapActivityModal } from './components/SwapActivityModal';
import { SavedTripsDrawer } from './components/SavedTripsDrawer';
import { ExportModal } from './components/ExportModal';
import { AdjustmentHistoryModal } from './components/AdjustmentHistoryModal';
import { AIChatConcierge } from './components/AIChatConcierge';
import { 
  Calendar, 
  Map, 
  PieChart, 
  CheckSquare, 
  BookOpen, 
  MapPin, 
  Clock
} from 'lucide-react';

export default function App() {
  const [itinerary, setItinerary] = useState<Itinerary>(() => {
    try {
      const stored = localStorage.getItem('voyageai_current_trip');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load current trip from localStorage', e);
    }
    return INITIAL_TOKYO_TRIP;
  });

  const [savedTrips, setSavedTrips] = useState<Itinerary[]>(() => {
    try {
      const stored = localStorage.getItem('voyageai_saved_trips');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load saved trips from localStorage', e);
    }
    return [INITIAL_TOKYO_TRIP];
  });

  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'budget' | 'packing' | 'guide'>('itinerary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [lastAdjustmentMessage, setLastAdjustmentMessage] = useState<string | undefined>(undefined);

  // Modals & Drawers state
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isSavedTripsDrawerOpen, setIsSavedTripsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEfficiencyModalOpen, setIsEfficiencyModalOpen] = useState(false);
  const [isAdjustmentHistoryOpen, setIsAdjustmentHistoryOpen] = useState(false);
  const [swapModalTarget, setSwapModalTarget] = useState<{ activity: ActivityItem; dayNumber: number } | null>(null);

  // Persist to localStorage
  useEffect(() => {
    if (itinerary) {
      try {
        localStorage.setItem('voyageai_current_trip', JSON.stringify(itinerary));
      } catch (e) {
        console.error('Error saving current trip', e);
      }
    }
  }, [itinerary]);

  useEffect(() => {
    try {
      localStorage.setItem('voyageai_saved_trips', JSON.stringify(savedTrips));
    } catch (e) {
      console.error('Error saving saved trips list', e);
    }
  }, [savedTrips]);

  // Generate new trip
  const handleGenerateTrip = async (prefs: TripPreferences) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (!res.ok) throw new Error('Generation failed');
      const newItinerary: Itinerary = await res.json();

      setItinerary(newItinerary);
      setSavedTrips((prev) => [newItinerary, ...prev.filter((t) => t.id !== newItinerary.id)]);
      setIsNewTripModalOpen(false);
      setActiveTab('itinerary');
      setLastAdjustmentMessage('Initial itinerary generated and clustered by neighborhood.');
    } catch (error) {
      console.error('Trip generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Adjust trip in real-time
  const handleAdjustTrip = async (prompt: string) => {
    if (!itinerary) return;
    setIsAdjusting(true);
    try {
      const res = await fetch('/api/adjust-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary: itinerary,
          prompt: prompt,
        }),
      });

      if (!res.ok) throw new Error('Adjustment failed');
      const data = await res.json();

      if (data.itinerary) {
        setItinerary(data.itinerary);
        setSavedTrips((prev) => [data.itinerary, ...prev.filter((t) => t.id !== data.itinerary.id)]);
      }
      setLastAdjustmentMessage(data.message || 'Adjustments successfully applied.');
    } catch (error) {
      console.error('Adjustment failed:', error);
    } finally {
      setIsAdjusting(false);
    }
  };

  // Activity Swap
  const handleOpenSwapModal = (activity: ActivityItem, dayNumber: number) => {
    setSwapModalTarget({ activity, dayNumber });
  };

  const handleConfirmSwap = (oldActivityId: string, newActivity: ActivityItem, dayNumber: number) => {
    setItinerary((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const updatedActivities = day.activities.map((act) =>
          act.id === oldActivityId ? { ...newActivity, id: `swap-${Date.now()}` } : act
        );
        return {
          ...day,
          activities: updatedActivities,
          dayEstimatedCost: updatedActivities.reduce((s, a) => s + (a.estimatedCost || 0), 0),
        };
      });

      return {
        ...prev,
        days: updatedDays,
        updatedAt: new Date().toISOString(),
      };
    });
    setLastAdjustmentMessage(`Replaced stop on Day ${dayNumber} with: ${newActivity.title}`);
  };

  // Delete Activity
  const handleDeleteActivity = (activityId: string, dayNumber: number) => {
    setItinerary((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const updatedActivities = day.activities.filter((act) => act.id !== activityId);
        return {
          ...day,
          activities: updatedActivities,
          dayEstimatedCost: updatedActivities.reduce((s, a) => s + (a.estimatedCost || 0), 0),
        };
      });
      return {
        ...prev,
        days: updatedDays,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Add Custom Activity
  const handleAddCustomActivity = (dayNumber: number, partialActivity: Partial<ActivityItem>) => {
    const fullActivity: ActivityItem = {
      id: `custom-${Date.now()}`,
      timeSlot: 'afternoon',
      time: partialActivity.time || '03:00 PM',
      title: partialActivity.title || 'Custom Stop',
      category: partialActivity.category || 'sightseeing',
      description: partialActivity.description || 'Added to itinerary.',
      location: partialActivity.location || `${itinerary.destination}`,
      neighborhood: partialActivity.neighborhood || 'Central',
      estimatedCost: partialActivity.estimatedCost || 0,
      currency: itinerary.budgetBreakdown.currency || 'USD',
      durationMinutes: partialActivity.durationMinutes || 60,
      proTip: partialActivity.proTip || 'Enjoy your visit!',
      coordinates: partialActivity.coordinates || { lat: 35.6762, lng: 139.6503 },
      isCustom: true,
    };

    setItinerary((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const updatedActivities = [...day.activities, fullActivity];
        return {
          ...day,
          activities: updatedActivities,
          dayEstimatedCost: updatedActivities.reduce((s, a) => s + (a.estimatedCost || 0), 0),
        };
      });
      return {
        ...prev,
        days: updatedDays,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Move Activity between Days
  const handleMoveActivity = (activityId: string, fromDay: number, toDay: number) => {
    setItinerary((prev) => {
      let targetAct: ActivityItem | undefined;
      const daysMinus = prev.days.map((d) => {
        if (d.dayNumber === fromDay) {
          targetAct = d.activities.find((a) => a.id === activityId);
          return {
            ...d,
            activities: d.activities.filter((a) => a.id !== activityId),
          };
        }
        return d;
      });

      if (!targetAct) return prev;

      const daysPlus = daysMinus.map((d) => {
        if (d.dayNumber === toDay) {
          return {
            ...d,
            activities: [...d.activities, targetAct!],
          };
        }
        return d;
      });

      return {
        ...prev,
        days: daysPlus,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Toggle packing checklist item
  const handleTogglePackingItem = (categoryName: string, itemId: string) => {
    setItinerary((prev) => {
      const updated = prev.packingChecklist.map((cat) => {
        if (cat.category !== categoryName) return cat;
        return {
          ...cat,
          items: cat.items.map((it) => (it.id === itemId ? { ...it, packed: !it.packed } : it)),
        };
      });
      return { ...prev, packingChecklist: updated };
    });
  };

  // Add packing item
  const handleAddPackingItem = (categoryName: string, itemName: string) => {
    setItinerary((prev) => {
      const updated = prev.packingChecklist.map((cat) => {
        if (cat.category !== categoryName) return cat;
        return {
          ...cat,
          items: [
            ...cat.items,
            { id: `pack-cust-${Date.now()}`, name: itemName, packed: false, isEssential: false },
          ],
        };
      });
      return { ...prev, packingChecklist: updated };
    });
  };

  // Load curated showcase preset
  const handleLoadPreset = (key: string) => {
    if (key === 'tokyo') {
      setItinerary(INITIAL_TOKYO_TRIP);
      setSavedTrips((prev) => [INITIAL_TOKYO_TRIP, ...prev.filter((t) => t.id !== INITIAL_TOKYO_TRIP.id)]);
      setLastAdjustmentMessage('Loaded Tokyo 4-Day Cultural & Culinary Immersion.');
    } else if (key === 'paris') {
      handleGenerateTrip({
        destination: 'Paris, France',
        duration: 3,
        travelStyle: 'balanced',
        groupType: 'couple',
        budgetTier: 'moderate',
        interests: ['Culinary & Street Food', 'Museums & Fine Art', 'Hidden Local Gems'],
        dietary: ['None'],
        specialRequests: 'Focus on historic passages, artisanal bakeries, and Impressionist art.',
      });
    }
  };

  // Delete saved trip
  const handleDeleteSavedTrip = (tripId: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans selection:bg-stone-200 selection:text-stone-900">
      {/* Top Application Header */}
      <Header
        currentTrip={itinerary}
        savedTripsCount={savedTrips.length}
        onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
        onOpenSavedTrips={() => setIsSavedTripsDrawerOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onToggleEfficiencyModal={() => setIsEfficiencyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Destination Hero Banner */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 mb-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              {/* Clean unboxed metadata per design constitution */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {itinerary.destination}, {itinerary.country}
                </span>
                <span className="text-stone-300">·</span>
                <span className="capitalize">{itinerary.preferences?.travelStyle || 'Balanced'} Pace</span>
                <span className="text-stone-300">·</span>
                <span className="capitalize">{itinerary.preferences?.groupType || 'Travelers'}</span>
                <span className="text-stone-300">·</span>
                <span>{itinerary.days.length} Days</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight leading-tight mb-2.5">
                {itinerary.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
                {itinerary.summary}
              </p>
            </div>

            {/* Quick Trip Stats Card */}
            <div className="flex flex-row lg:flex-col gap-3 shrink-0 self-start lg:self-center">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-left min-w-[160px]">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Est. Trip Budget
                </span>
                <span className="text-lg font-bold text-stone-900">
                  {itinerary.budgetBreakdown.currency}{' '}
                  {itinerary.budgetBreakdown.total.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-left min-w-[160px]">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                  Route Optimization
                </span>
                <span className="text-lg font-bold text-stone-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-500" />
                  +40% Efficiency
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Benchmark Banner */}
        <EfficiencyBanner
          metrics={itinerary.efficiencyMetrics}
          showModal={isEfficiencyModalOpen}
          onCloseModal={() => setIsEfficiencyModalOpen(false)}
          onOpenModal={() => setIsEfficiencyModalOpen(true)}
        />

        {/* Real-time Schedule Modification Bar */}
        <RealtimeAdjustmentBar
          onAdjust={handleAdjustTrip}
          isLoading={isAdjusting}
          adjustmentHistoryCount={itinerary.adjustmentHistory?.length || 0}
          onOpenHistory={() => setIsAdjustmentHistoryOpen(true)}
          lastAdjustmentMessage={lastAdjustmentMessage}
        />

        {/* Clean Segmented Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl mb-6 overflow-x-auto border border-stone-200/80 scrollbar-thin">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'itinerary'
                ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
            <span className="text-xs text-stone-400">({itinerary.days.length} Days)</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'map'
                ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Route Map</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'budget'
                ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Budget</span>
          </button>

          <button
            onClick={() => setActiveTab('packing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'packing'
                ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Packing List</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'guide'
                ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Local Guide</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'itinerary' && (
          <ItineraryDayView
            days={itinerary.days}
            currency={itinerary.budgetBreakdown.currency}
            onSwapActivity={handleOpenSwapModal}
            onDeleteActivity={handleDeleteActivity}
            onAddCustomActivity={handleAddCustomActivity}
            onMoveActivity={handleMoveActivity}
          />
        )}

        {activeTab === 'map' && (
          <RouteMapVisualizer
            days={itinerary.days}
            destination={itinerary.destination}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetTracker
            budget={itinerary.budgetBreakdown}
            durationDays={itinerary.days.length}
          />
        )}

        {activeTab === 'packing' && (
          <PackingChecklist
            categories={itinerary.packingChecklist}
            destination={itinerary.destination}
            onToggleItem={handleTogglePackingItem}
            onAddItem={handleAddPackingItem}
          />
        )}

        {activeTab === 'guide' && (
          <LocalGuide
            insights={itinerary.localInsights}
            destination={itinerary.destination}
          />
        )}
      </main>

      {/* Floating Travel Concierge */}
      <AIChatConcierge itinerary={itinerary} />

      {/* Modals and Drawers */}
      <TripBuilderModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        onGenerate={handleGenerateTrip}
        isGenerating={isGenerating}
      />

      <SwapActivityModal
        isOpen={Boolean(swapModalTarget)}
        activity={swapModalTarget?.activity || null}
        dayNumber={swapModalTarget?.dayNumber || 1}
        destination={itinerary.destination}
        onClose={() => setSwapModalTarget(null)}
        onConfirmSwap={handleConfirmSwap}
      />

      <SavedTripsDrawer
        isOpen={isSavedTripsDrawerOpen}
        onClose={() => setIsSavedTripsDrawerOpen(false)}
        savedTrips={savedTrips}
        currentTripId={itinerary.id}
        onSelectTrip={(t) => setItinerary(t)}
        onDeleteTrip={handleDeleteSavedTrip}
        onLoadPreset={handleLoadPreset}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        itinerary={itinerary}
      />

      <AdjustmentHistoryModal
        isOpen={isAdjustmentHistoryOpen}
        onClose={() => setIsAdjustmentHistoryOpen(false)}
        history={itinerary.adjustmentHistory}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Voyage</span>
            <span>·</span>
            <span>Personalized Travel Itinerary & Route Optimization</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span>Neighborhood Clustering</span>
            <span>·</span>
            <span>+40% Efficiency</span>
            <span>·</span>
            <span>Calendar & PDF Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
