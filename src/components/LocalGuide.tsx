import React from 'react';
import { LocalInsight } from '../types/trip';
import { BookOpen, PhoneCall, Smartphone, HeartHandshake, Compass } from 'lucide-react';

interface LocalGuideProps {
  insights: LocalInsight;
  destination: string;
}

export const LocalGuide: React.FC<LocalGuideProps> = ({ insights, destination }) => {
  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-6 text-stone-900">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-stone-700" />
          <h3 className="text-base font-bold text-stone-900">Local Guide & Customs</h3>
        </div>
        <p className="text-xs text-stone-500 mt-0.5">
          Practical advice for getting around and etiquette in {destination}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tipping & Payments */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-4 h-4 text-stone-600" />
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Tipping & Payment</h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            {insights.tippingEtiquette}
          </p>
          <div className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
            <strong>Payment note: </strong>Keep small denomination bills on hand for neighborhood kiosks and traditional street vendors.
          </div>
        </div>

        {/* Public Transit Guide */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-stone-600" />
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Transit & Navigation</h4>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            {insights.transitTips}
          </p>
          <div className="text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
            <strong>Transit note: </strong>Contactless transit passes in your phone wallet help avoid station ticket queues.
          </div>
        </div>

        {/* Cultural Etiquette */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center gap-2 mb-2.5">
            <BookOpen className="w-4 h-4 text-stone-600" />
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Cultural Etiquette</h4>
          </div>
          <ul className="space-y-2 text-xs text-stone-600">
            {insights.culturalEtiquette.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency & Apps */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PhoneCall className="w-4 h-4 text-stone-600" />
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Emergency Contacts</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Police</span>
                <span className="font-bold text-stone-900 text-sm">{insights.emergencyNumbers?.police || '112'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Medical / Ambulance</span>
                <span className="font-bold text-stone-900 text-sm">{insights.emergencyNumbers?.ambulance || '112'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-stone-600" />
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Helpful Apps</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {insights.bestAppsToDownload?.map((app, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-white border border-stone-200 text-xs text-stone-700 font-medium"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
