import React, { useState } from 'react';
import { BudgetBreakdown } from '../types/trip';
import { Bed, Utensils, Ticket, Train, ShieldCheck, PieChart } from 'lucide-react';

interface BudgetTrackerProps {
  budget: BudgetBreakdown;
  durationDays: number;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budget, durationDays }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(budget.currency || 'USD');

  const CONVERSIONS: Record<string, number> = {
    USD: budget.currency === 'JPY' ? 1 / 155 : budget.currency === 'EUR' ? 1.08 : 1,
    EUR: budget.currency === 'JPY' ? 1 / 168 : budget.currency === 'USD' ? 0.92 : 1,
    JPY: budget.currency === 'USD' ? 155 : budget.currency === 'EUR' ? 168 : 1,
    GBP: budget.currency === 'JPY' ? 1 / 198 : budget.currency === 'USD' ? 0.79 : 0.86,
  };

  const rate = CONVERSIONS[selectedCurrency] || 1;

  const formatAmount = (val: number) => {
    const converted = Math.round(val * rate);
    if (selectedCurrency === 'JPY') return `¥${converted.toLocaleString()}`;
    if (selectedCurrency === 'EUR') return `€${converted.toLocaleString()}`;
    if (selectedCurrency === 'GBP') return `£${converted.toLocaleString()}`;
    return `$${converted.toLocaleString()}`;
  };

  const total = budget.total || (budget.accommodation + budget.dining + budget.activities + budget.transport + budget.contingency);
  const dailyAverage = total / Math.max(1, durationDays);

  const categories = [
    { label: 'Accommodation', amount: budget.accommodation, icon: Bed, color: 'text-stone-700', bg: 'bg-stone-800' },
    { label: 'Dining & Food', amount: budget.dining, icon: Utensils, color: 'text-stone-700', bg: 'bg-stone-600' },
    { label: 'Attractions & Entry', amount: budget.activities, icon: Ticket, color: 'text-stone-700', bg: 'bg-stone-500' },
    { label: 'Local Transit', amount: budget.transport, icon: Train, color: 'text-stone-700', bg: 'bg-stone-400' },
    { label: 'Buffer & Incidentals', amount: budget.contingency, icon: ShieldCheck, color: 'text-stone-700', bg: 'bg-stone-300' },
  ];

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-xs text-stone-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-stone-700" />
            <h3 className="text-base font-bold text-stone-900">Budget & Cost Estimates</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Calculated from scheduled entries, average meal costs, and local transit fares
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 self-start sm:self-auto">
          {(['USD', 'EUR', 'JPY', 'GBP'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                selectedCurrency === curr
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
          <span className="text-xs text-stone-500 uppercase font-medium">Total Projected Cost</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{formatAmount(total)}</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Estimated total for {durationDays} days</span>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
          <span className="text-xs text-stone-500 uppercase font-medium">Daily Average</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{formatAmount(dailyAverage)}</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Lodging, dining & transport</span>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
          <span className="text-xs text-stone-500 uppercase font-medium">Budget Balance</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">Balanced</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Blends paid sights with free walks</span>
        </div>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="mb-6">
        <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden flex border border-stone-200">
          {categories.map((cat, i) => {
            const pct = (cat.amount / (total || 1)) * 100;
            return (
              <div
                key={i}
                style={{ width: `${pct}%` }}
                className={`${cat.bg} transition-all duration-300`}
                title={`${cat.label}: ${formatAmount(cat.amount)} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          const pct = Math.round((cat.amount / (total || 1)) * 100);
          return (
            <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">{cat.label}</h4>
                  <span className="text-[11px] text-stone-500">{pct}% of budget</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-stone-900">{formatAmount(cat.amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
