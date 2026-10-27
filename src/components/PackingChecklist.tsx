import React, { useState } from 'react';
import { PackingCategory } from '../types/trip';
import { CheckSquare, Square, Plus, CheckCircle2 } from 'lucide-react';

interface PackingChecklistProps {
  categories: PackingCategory[];
  destination: string;
  onToggleItem: (categoryId: string, itemId: string) => void;
  onAddItem: (categoryId: string, itemName: string) => void;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({
  categories,
  destination,
  onToggleItem,
  onAddItem,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.category || 'General');

  let totalItems = 0;
  let packedItems = 0;
  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      totalItems++;
      if (item.packed) packedItems++;
    });
  });

  const completionPct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(selectedCategory, newItemName.trim());
    setNewItemName('');
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 shadow-xs text-stone-900">
      {/* Header and Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-stone-700" />
            <h3 className="text-base font-bold text-stone-900">Packing Checklist</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Suggested items for {destination} weather and scheduled activities
          </p>
        </div>

        {/* Progress stat */}
        <div className="flex items-center gap-3 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 self-start sm:self-auto">
          <div className="w-24 bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-stone-800 h-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-stone-800">
            {packedItems} / {totalItems} Packed ({completionPct}%)
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {categories.map((cat) => (
          <div key={cat.category} className="bg-stone-50 border border-stone-200/80 rounded-xl p-4">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              {cat.category}
            </h4>

            <div className="space-y-1.5">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleItem(cat.category, item.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg transition cursor-pointer select-none ${
                    item.packed
                      ? 'bg-stone-200/50 text-stone-400 line-through'
                      : 'hover:bg-white text-stone-700'
                  }`}
                >
                  {item.packed ? (
                    <CheckSquare className="w-4 h-4 text-stone-700 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                  <span className="text-xs flex-1">{item.name}</span>
                  {item.isEssential && (
                    <span className="text-[10px] uppercase font-semibold text-stone-600 bg-stone-200/70 px-1.5 py-0.2 rounded">
                      Essential
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row items-center gap-2 pt-4 border-t border-stone-100">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
        >
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Add custom packing item (e.g. Travel adapter, rain shell)..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 w-full bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
        />

        <button
          type="submit"
          disabled={!newItemName.trim()}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-xs font-medium text-white flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </form>
    </div>
  );
};
