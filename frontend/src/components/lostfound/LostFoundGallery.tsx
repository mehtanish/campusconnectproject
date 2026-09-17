'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { ITEM_STATUS_CONFIG, type LostFoundResponse } from '@/types';

interface LostFoundGalleryProps {
  items: LostFoundResponse[];
  isAdmin?: boolean;
  onClaimItem?: (item: LostFoundResponse) => void;
}

export function LostFoundGallery({
  items,
  isAdmin = false,
  onClaimItem,
}: LostFoundGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showRedactedMap, setShowRedactedMap] = useState<Record<string, boolean>>({});

  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const toggleRedact = (itemId: string) => {
    setShowRedactedMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry / Responsive Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredItems.map((item) => {
            const statusConfig = ITEM_STATUS_CONFIG[item.status];
            const isRedactedShown = showRedactedMap[item.id];

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="glass-card overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Blur Preview Toggle */}
                  <div className="relative h-48 w-full bg-slate-900/60 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          !isRedactedShown && isAdmin ? 'blur-md scale-105' : 'group-hover:scale-105'
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-muted)] bg-indigo-950/20">
                        <Sparkles className="w-8 h-8 text-indigo-400/50 mb-2" />
                        <span className="text-xs">No image provided</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border border-white/10 backdrop-blur-md ${statusConfig.bgColor} ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Admin Blur Toggle Slider Button */}
                    {isAdmin && item.hiddenDetails && (
                      <button
                        type="button"
                        onClick={() => toggleRedact(item.id)}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all"
                      >
                        {isRedactedShown ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                            <span>Redact Preview</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Unblur Preview</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h4 className="text-base font-semibold text-[var(--text-primary)] mt-1">
                        {item.title}
                      </h4>
                    </div>

                    <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{item.foundLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Found on {item.foundDate}</span>
                      </div>
                    </div>

                    {/* Hidden Admin Verification Details */}
                    {isAdmin && item.hiddenDetails && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-xs text-amber-200">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Admin Hidden Verification Info:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{item.hiddenDetails}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-[var(--border-color)]/60 bg-[var(--bg-secondary)]/30">
                  {item.status === 'LISTED' ? (
                    <button
                      type="button"
                      onClick={() => onClaimItem?.(item)}
                      className="w-full text-xs font-semibold py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/20"
                    >
                      Claim This Item
                    </button>
                  ) : (
                    <div className="text-center text-xs font-medium text-[var(--text-muted)] py-1">
                      {item.status === 'CLAIM_PENDING' ? 'Claim Under Review' : 'Item Handed Over'}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
