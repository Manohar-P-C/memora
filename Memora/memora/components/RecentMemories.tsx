'use client';

import React, { useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Memory } from '@/types/memory';
import { MemoryCard } from './MemoryCard';
import { FilterPills, DEFAULT_CATEGORIES } from './FilterPills';

gsap.registerPlugin(useGSAP);

interface RecentMemoriesProps {
  memories: Memory[];
  onViewSource?: (memory: Memory) => void;
  onTagClick?: (tag: string) => void;
  onSelectMemory?: (memory: Memory) => void;
  onViewAllClick?: () => void;
  totalCount?: number;
  onDeleteMemory?: (id: string) => void;
}

const matchesCategory = (mem: Memory, category: string): boolean => {
  if (category === 'all') return true;
  const t = (mem.type || '').toLowerCase();
  const title = (mem.title || '').toLowerCase();
  const tags = (mem.tags || []).map((x) => x.toLowerCase());
  const filename = (mem.source_file?.filename || mem.absolute_path || '').toLowerCase();
  const isPhoto = /\.(jpe?g|png|webp|gif|svg)$/i.test(filename) || mem.source_file?.mime_type?.startsWith('image/') || t === 'photo';

  switch (category) {
    case 'invoice':
      return (
        t === 'invoice' ||
        t === 'purchase' ||
        t === 'receipt' ||
        tags.some((tag) => /invoice|receipt|bill|purchase|tax|payment/.test(tag)) ||
        /invoice|bill|receipt|order|payment/i.test(title)
      );
    case 'warranty':
      return t === 'warranty' || tags.some((tag) => /warranty|guarantee/.test(tag)) || /warranty|guarantee/i.test(title);
    case 'contract':
      return (
        t === 'contract' ||
        t === 'employment' ||
        t === 'housing' ||
        tags.some((tag) => /contract|agreement|nda|employment|job|offer|lease/.test(tag)) ||
        /contract|agreement|nda|offer letter|lease/i.test(title)
      );
    case 'travel':
      return (
        t === 'travel' ||
        tags.some((tag) => /travel|flight|trip|hotel|boarding/.test(tag)) ||
        /flight|ticket|boarding|airline|hotel|trip/i.test(title)
      );
    case 'photo':
      return isPhoto;
    case 'other':
      return (
        !matchesCategory(mem, 'invoice') &&
        !matchesCategory(mem, 'warranty') &&
        !matchesCategory(mem, 'contract') &&
        !matchesCategory(mem, 'travel') &&
        !isPhoto
      );
    default:
      return true;
  }
};

export const RecentMemories: React.FC<RecentMemoriesProps> = ({
  memories,
  onViewSource,
  onTagClick,
  onSelectMemory,
  onViewAllClick,
  totalCount,
  onDeleteMemory,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: memories.length };
    DEFAULT_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        map[cat.id] = memories.filter((m) => matchesCategory(m, cat.id)).length;
      }
    });
    return map;
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => matchesCategory(m, selectedCategory));
  }, [memories, selectedCategory]);

  const displayCount = totalCount !== undefined ? totalCount : memories.length;

  useGSAP(
    () => {
      if (filteredMemories.length > 0) {
        gsap.from('.memory-item-wrapper', {
          y: 12,
          opacity: 0,
          stagger: 0.05,
          duration: 0.35,
          ease: 'power2.out',
        });
      }
    },
    { dependencies: [filteredMemories.length, selectedCategory], scope: containerRef }
  );

  return (
    <section ref={containerRef} className="mb-space-xl will-change-transform">
      <div className="flex items-baseline justify-between border-b border-outline-variant pb-space-xs mb-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Recently added</h2>
        <button
          type="button"
          onClick={onViewAllClick}
          className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors duration-150 cursor-pointer"
        >
          View all archive ({displayCount})
        </button>
      </div>

      {/* Category Pills Filter */}
      {memories.length > 0 && (
        <div className="mb-space-md">
          <FilterPills
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={counts}
          />
        </div>
      )}

      <div className="divide-y divide-outline-variant">
        {memories.length === 0 ? (
          <div className="py-space-md text-secondary font-body-sm text-body-sm">
            No memories added yet. Upload a document below to begin your archive.
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="py-space-lg text-center text-secondary font-body-sm text-body-sm">
            <p>No memories match this filter.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="mt-2 text-primary hover:underline font-label-sm text-label-sm cursor-pointer"
            >
              Show all memories ({memories.length})
            </button>
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div key={mem.id} className="memory-item-wrapper">
              <MemoryCard
                memory={mem}
                onViewSource={onViewSource}
                onTagClick={onTagClick}
                onSelectMemory={onSelectMemory}
                onDelete={onDeleteMemory}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
};


