'use client';

import React from 'react';

export interface FilterCategory {
  id: string;
  label: string;
  icon?: string;
}

export const DEFAULT_CATEGORIES: FilterCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'invoice', label: 'Invoices & Bills', icon: '🧾' },
  { id: 'warranty', label: 'Warranties', icon: '🛡️' },
  { id: 'contract', label: 'Contracts & Work', icon: '📜' },
  { id: 'travel', label: 'Travel & Tickets', icon: '✈️' },
  { id: 'photo', label: 'Photos', icon: '📷' },
  { id: 'other', label: 'Other Docs', icon: '📁' },
];

interface FilterPillsProps {
  categories?: FilterCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  counts?: Record<string, number>;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
  counts = {},
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none select-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = counts[cat.id];

        // If not 'all' and count is 0, we can still show or hide. Showing with 0 or omitting gives feedback.
        if (cat.id !== 'all' && count === 0) return null;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm transition-all duration-150 cursor-pointer whitespace-nowrap border ${
              isSelected
                ? 'bg-on-surface text-surface border-on-surface shadow-xs font-medium'
                : 'bg-surface-container text-secondary border-outline-variant hover:text-on-surface hover:border-outline'
            }`}
          >
            {cat.icon && <span className="text-xs">{cat.icon}</span>}
            <span>{cat.label}</span>
            {count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected
                    ? 'bg-surface/20 text-surface'
                    : 'bg-surface-container-high text-secondary'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

