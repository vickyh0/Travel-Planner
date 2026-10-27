export type TravelStyle = 'relaxed' | 'balanced' | 'fast-paced' | 'luxury' | 'adventure';
export type GroupType = 'solo' | 'couple' | 'family' | 'friends' | 'business';
export type BudgetTier = 'budget' | 'moderate' | 'luxury';

export type ActivityCategory = 
  | 'sightseeing'
  | 'dining'
  | 'culture'
  | 'outdoor'
  | 'leisure'
  | 'nightlife'
  | 'shopping'
  | 'transit';

export interface TransitInfo {
  mode: 'walk' | 'metro' | 'taxi' | 'bus' | 'train' | 'ferry';
  durationMinutes: number;
  instructions: string;
}

export interface ActivityItem {
  id: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  time: string;
  title: string;
  category: ActivityCategory;
  description: string;
  location: string;
  neighborhood: string;
  estimatedCost: number;
  currency: string;
  durationMinutes: number;
  proTip: string;
  transitFromPrevious?: TransitInfo;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  isCustom?: boolean;
}

export interface TripDay {
  dayNumber: number;
  date?: string;
  title: string;
  theme: string;
  weatherForecast?: {
    temp: string;
    condition: string;
    icon: string;
    advice: string;
  };
  activities: ActivityItem[];
  dayHighlights: string[];
  dayEstimatedCost: number;
}

export interface BudgetBreakdown {
  accommodation: number;
  dining: number;
  activities: number;
  transport: number;
  contingency: number;
  total: number;
  currency: string;
}

export interface EfficiencyMetrics {
  planningHoursSaved: number;
  efficiencyImprovementPct: number;
  routeClusteringScore: number; // e.g. 92%
  transitTimeSavedMinutes: number;
  totalStops: number;
}

export interface PackingItem {
  id: string;
  name: string;
  packed: boolean;
  isEssential: boolean;
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface LocalInsight {
  tippingEtiquette: string;
  transitTips: string;
  culturalEtiquette: string[];
  emergencyNumbers: {
    police: string;
    ambulance: string;
  };
  bestAppsToDownload: string[];
}

export interface TripPreferences {
  destination: string;
  origin?: string;
  duration: number; // in days
  startDate?: string;
  travelStyle: TravelStyle;
  groupType: GroupType;
  budgetTier: BudgetTier;
  interests: string[];
  dietary: string[];
  mobilityNotes?: string;
  specialRequests?: string;
}

export interface Itinerary {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  destination: string;
  country: string;
  summary: string;
  days: TripDay[];
  budgetBreakdown: BudgetBreakdown;
  efficiencyMetrics: EfficiencyMetrics;
  localInsights: LocalInsight;
  packingChecklist: PackingCategory[];
  preferences: TripPreferences;
  adjustmentHistory?: {
    timestamp: string;
    prompt: string;
    changeSummary: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
