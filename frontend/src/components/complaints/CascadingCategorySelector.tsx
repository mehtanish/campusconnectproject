'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Layers, Check, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import type { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface CascadingCategorySelectorProps {
  onSelectCategory: (category: Category, locationPath: string) => void;
  selectedCategoryId?: string;
}

export function CascadingCategorySelector({
  onSelectCategory,
}: CascadingCategorySelectorProps) {
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, Category[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchRoots = useCallback(async () => {
    try {
      setError(null);
      setLoadingMap((prev) => ({ ...prev, root: true }));
      const res = await api.get<Category[]>('/api/categories');
      setRootCategories(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch categories:', err);
      const message = err instanceof Error ? err.message : 'Network error';
      setError(`Failed to fetch categories (${message}). Ensure backend API is active on port 8081.`);
    } finally {
      setLoadingMap((prev) => ({ ...prev, root: false }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchRoots();
    });
    return () => { isMounted = false; };
  }, [fetchRoots]);

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
        className="flex-1 min-w-[220px] border border-cyan-500/20 bg-slate-950/80 rounded-2xl p-2.5 space-y-1.5 shadow-lg backdrop-blur-md"
      >
        <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 flex items-center justify-between border-b border-slate-800/80 mb-1">
          <span>Level {level + 1}</span>
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
        </div>

        {isLoading && !categories.length ? (
          <div className="space-y-2 p-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          categories.map((cat) => {
            const isSelected = currentSelected?.id === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectLevel(cat, level)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20 border border-cyan-400/40'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat.hasChildren ? (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-white translate-x-0.5' : 'text-slate-500'
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

  if (error && !rootCategories.length && !loadingMap['root']) {
    return (
      <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-rose-200 space-y-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 font-semibold text-sm text-rose-400">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Category Pipeline Error</span>
        </div>
        <p className="text-xs text-rose-300/80 leading-relaxed font-mono">{error}</p>
        <Button
          variant="danger"
          size="sm"
          onClick={fetchRoots}
          className="gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-400" />
        Select Category & Location Path
      </label>

      {/* Path Breadcrumb */}
      {selectedPath.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-xl overflow-x-auto shadow-inner">
          {selectedPath.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              <span className="shrink-0">{item.name}</span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Cascading Columns */}
      <div className="flex gap-3 overflow-x-auto pb-2">
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
