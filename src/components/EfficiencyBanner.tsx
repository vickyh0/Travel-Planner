import React from 'react';
import { Clock, Navigation, CheckCircle2, TrendingUp, X, ArrowRight } from 'lucide-react';
import { EfficiencyMetrics } from '../types/trip';

interface EfficiencyBannerProps {
  metrics: EfficiencyMetrics;
  showModal: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export const EfficiencyBanner: React.FC<EfficiencyBannerProps> = ({
  metrics,
  showModal,
  onCloseModal,
  onOpenModal,
}) => {
  return (
    <>
      {/* Inline Compact Highlight Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 mb-6 shadow-xs text-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-900">
                  Route & Timing Optimization
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  +{metrics.efficiencyImprovementPct}% planning efficiency
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {metrics.totalStops} stops clustered by neighborhood — saved an estimated{' '}
                <strong className="text-stone-800 font-semibold">{metrics.planningHoursSaved} hours</strong> of manual mapping and{' '}
                <strong className="text-stone-800 font-semibold">{Math.round(metrics.transitTimeSavedMinutes / 60 * 10) / 10} hours</strong> of backtracking.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenModal}
            className="self-start sm:self-center text-xs text-stone-700 hover:text-stone-900 font-medium underline underline-offset-4 decoration-stone-300 hover:decoration-stone-700 transition cursor-pointer"
          >
            How it works →
          </button>
        </div>
      </div>

      {/* Detailed Modal Breakdown */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-6 text-stone-900 shadow-xl relative">
            <button
              onClick={onCloseModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Itinerary Optimization Model</h3>
                <p className="text-xs text-stone-500">How sequential clustering streamlines trip logistics</p>
              </div>
            </div>

            <div className="space-y-3 my-5">
              {/* Stat Card 1 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <Clock className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-semibold text-stone-900">Curation Time Saved</h4>
                    <span className="text-xs font-bold text-stone-900">~{metrics.planningHoursSaved} hrs</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Eliminates searching across dozen disparate blogs, opening hours, and reservation slots.
                  </p>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <Navigation className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-semibold text-stone-900">Neighborhood Clustering</h4>
                    <span className="text-xs font-bold text-stone-900">{metrics.routeClusteringScore}% Score</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Daily stops are sequenced in geographic clusters or along direct metro lines to minimize transit overhead.
                  </p>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-semibold text-stone-900">Dynamic Adjustments</h4>
                    <span className="text-xs font-bold text-stone-900">Instant</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Weather or pacing changes re-balance stops without breaking subsequent reservations.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-100 text-xs text-stone-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-stone-600 shrink-0" />
              <span>Personalized trip generation with real-time recalculations.</span>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={onCloseModal}
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-xs font-medium text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
