import React, { useState } from 'react';
import { TripPreferences, TravelStyle, GroupType, BudgetTier } from '../types/trip';
import { 
  X, 
  MapPin, 
  Compass, 
  Check, 
  Loader2,
  ArrowRight
} from 'lucide-react';

interface TripBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prefs: TripPreferences) => Promise<void>;
  isGenerating: boolean;
}

const POPULAR_DESTINATIONS = [
  'Tokyo, Japan',
  'Paris, France',
  'Kyoto, Japan',
  'Rome, Italy',
  'Barcelona, Spain',
  'Amalfi Coast, Italy',
  'New York City, USA',
  'Bangkok, Thailand',
  'Reykjavik, Iceland',
  'Oaxaca, Mexico',
];

const INTEREST_OPTIONS = [
  'Culinary & Street Food',
  'Historic Architecture',
  'Museums & Fine Art',
  'Hidden Local Gems',
  'Nature & Scenic Walks',
  'Nightlife & Craft Bars',
  'Specialty Coffee & Cafes',
  'Traditional Markets',
  'Photography Spots',
  'Independent Shopping',
];

const DIETARY_OPTIONS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Gluten-Free',
  'Pescatarian',
  'No Shellfish',
];

export const TripBuilderModal: React.FC<TripBuilderModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(4);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('balanced');
  const [groupType, setGroupType] = useState<GroupType>('couple');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Culinary & Street Food',
    'Hidden Local Gems',
    'Historic Architecture',
  ]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['None']);
  const [specialRequests, setSpecialRequests] = useState('');

  const [generationStep, setGenerationStep] = useState(0);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleDietary = (diet: string) => {
    if (diet === 'None') {
      setSelectedDietary(['None']);
      return;
    }
    setSelectedDietary((prev) => {
      const filtered = prev.filter((d) => d !== 'None');
      return filtered.includes(diet) ? filtered.filter((d) => d !== diet) : [...filtered, diet];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || isGenerating) return;

    setGenerationStep(1);
    const timer1 = setTimeout(() => setGenerationStep(2), 700);
    const timer2 = setTimeout(() => setGenerationStep(3), 1500);

    await onGenerate({
      destination: destination.trim(),
      duration: Number(duration),
      travelStyle: travelStyle,
      groupType: groupType,
      budgetTier: budgetTier,
      interests: selectedInterests,
      dietary: selectedDietary,
      specialRequests: specialRequests.trim(),
    });

    clearTimeout(timer1);
    clearTimeout(timer2);
    setGenerationStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-stone-900 shadow-xl relative my-8">
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">Plan a New Trip</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Personalized day-by-day itinerary with geographic neighborhood clustering
            </p>
          </div>
        </div>

        {isGenerating ? (
          <div className="py-12 px-4 text-center space-y-5">
            <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-stone-100">
              <Loader2 className="w-6 h-6 animate-spin text-stone-700" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-stone-900">
                {generationStep === 1 && `Mapping destinations in ${destination}...`}
                {generationStep === 2 && `Clustering stops to minimize travel transit...`}
                {generationStep >= 3 && `Finalizing timings and local notes...`}
                {generationStep === 0 && `Preparing your itinerary...`}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Organizing routes geographically so you spend less time in transit and more time exploring.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Destination Selection */}
            <div>
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
                1. Destination
              </label>
              <div className="relative mb-2.5">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tokyo, Japan or Paris, France or Florence, Italy..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                />
              </div>

              {/* Popular destination quick tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-stone-400 mr-1">Popular:</span>
                {POPULAR_DESTINATIONS.map((pop) => (
                  <button
                    key={pop}
                    type="button"
                    onClick={() => setDestination(pop)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200/80 text-stone-600 hover:text-stone-900 border border-stone-200/80 transition cursor-pointer"
                  >
                    {pop.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Pacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                    2. Duration
                  </label>
                  <span className="text-xs font-bold text-stone-900">{duration} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>1 Day</span>
                  <span>7 Days</span>
                  <span>14 Days</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
                  3. Travel Pace
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['relaxed', 'balanced', 'fast-paced'] as TravelStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTravelStyle(style)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-medium capitalize border transition cursor-pointer ${
                        travelStyle === style
                          ? 'bg-stone-900 border-stone-900 text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Group & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
                  4. Travelers
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['solo', 'couple', 'family', 'friends', 'business'] as GroupType[]).map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setGroupType(group)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-medium capitalize border transition cursor-pointer ${
                        groupType === group
                          ? 'bg-stone-900 border-stone-900 text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
                  5. Budget
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['budget', 'moderate', 'luxury'] as BudgetTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setBudgetTier(tier)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-medium capitalize border transition cursor-pointer ${
                        budgetTier === tier
                          ? 'bg-stone-900 border-stone-900 text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tier === 'budget' ? 'Budget $' : tier === 'moderate' ? 'Moderate $$' : 'Luxury $$$'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interests Multi-Select */}
            <div>
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
                6. Interests ({selectedInterests.length})
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-stone-900 border-stone-900 text-white shadow-2xs'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div>
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
                7. Dietary Considerations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map((diet) => {
                  const isSelected = selectedDietary.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleDietary(diet)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        isSelected
                          ? 'bg-stone-800 border-stone-800 text-white font-semibold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-1">
                8. Special notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Love specialty bakeries, avoid steep hills, celebrating an anniversary..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!destination.trim()}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40"
              >
                <span>Generate Itinerary</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
