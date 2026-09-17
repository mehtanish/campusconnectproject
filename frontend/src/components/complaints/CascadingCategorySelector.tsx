'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Layers, Check, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import type { Category } from '@/types';

interface CascadingCategorySelectorProps {
  onSelectCategory: (category: Category, locationPath: string) => void;
  selectedCategoryId?: string;
}

export function CascadingCategorySelector({
  onSelectCategory,
  selectedCategoryId,
}: CascadingCategorySelectorProps) {
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, Category[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // Fetch root categories on mount
  useEffect(() => {
    async function fetchRoots() {
      try {
        setLoadingMap((prev) => ({ ...prev, root: true }));
        const res = await api.get<Category[]>('/api/categories');
        setRootCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingMap((prev) => ({ ...prev, root: false }));
      }
    }
    fetchRoots();
  }, []);

  const handleSelectLevel = async (category: Category, level: number) => {
    const newPath = [...selectedPath.slice(0, level), category];
    setSelectedPath(newPath);

    const pathString = newPath.map((c) => c.name).join(' > ');
    onSelectCategory(category, pathString);

    if (category.hasChildren && !childrenMap[category.id]) {
      try {
        setLoadingMap((prev) => ({ ...prev, [category.id]: true }));
        const res = await api.get<Category[]>(`/api/categories/${category.id}/children`);
        setChildrenMap((prev) => ({ ...prev, [category.id]: res.data }));
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
      } finally {
        setLoadingMap((prev) => ({ ...prev, [category.id]: false }));
      }
    }
  };

  const renderLevel = (categories: Category[], level: number, parentId?: string) => {
    const isLoading = parentId ? loadingMap[parentId] : loadingMap['root'];
    const currentSelected = selectedPath[level];

    return (
      <motion.div
        key={`level-${level}-${parentId || 'root'}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className="flex-1 min-w-[200px] border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 rounded-xl p-2 space-y-1"
      >
        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
          <span>Level {level + 1}</span>
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
        </div>

        {isLoading && !categories.length ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 bg-slate-700/20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const isSelected = currentSelected?.id === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectLevel(cat, level)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat.hasChildren ? (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-white translate-x-0.5' : 'text-[var(--text-muted)]'
                    }`}
                  />
                ) : isSelected ? (
                  <Check className="w-4 h-4 text-white" />
                ) : null}
              </button>
            );
          })
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-400" />
        Select Category & Location Path
      </label>

      {/* Path Breadcrumb */}
      {selectedPath.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg overflow-x-auto">
          {selectedPath.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
              <span className="shrink-0">{item.name}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Cascading Columns */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {renderLevel(rootCategories, 0)}

        <AnimatePresence mode="popLayout">
          {selectedPath.map((selectedCat, idx) => {
            if (selectedCat.hasChildren && childrenMap[selectedCat.id]) {
              return renderLevel(childrenMap[selectedCat.id], idx + 1, selectedCat.id);
            }
            return null;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
