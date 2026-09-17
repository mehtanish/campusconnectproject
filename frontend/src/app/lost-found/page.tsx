'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { LostFoundGallery } from '@/components/lostfound/LostFoundGallery';
import { ClaimWizardModal } from '@/components/lostfound/ClaimWizardModal';
import { PlusCircle, Search, Sparkles, X, Upload } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import type { LostFoundResponse } from '@/types';

export default function LostFoundPortal() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [items, setItems] = useState<LostFoundResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Claim Wizard Modal State
  const [selectedClaimItem, setSelectedClaimItem] = useState<LostFoundResponse | null>(null);
  const [isClaimWizardOpen, setIsClaimWizardOpen] = useState(false);

  // Report Item Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [hiddenDetails, setHiddenDetails] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<LostFoundResponse[]>('/api/lost-found');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch lost & found items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenClaimWizard = (item: LostFoundResponse) => {
    setSelectedClaimItem(item);
    setIsClaimWizardOpen(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      const reportData = {
        title,
        category,
        foundLocation,
        foundDate,
        hiddenDetails,
      };

      formData.append(
        'data',
        new Blob([JSON.stringify(reportData)], { type: 'application/json' })
      );
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.post('/api/lost-found', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Found item reported successfully!');
      setIsReportModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to report found item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Lost & Found <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Found something on campus? Report it here. Lost an item? Submit a claim with proof of ownership.
            </p>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found Item</span>
          </button>
        </div>

        {/* Masonry Gallery Component */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 glass-card animate-pulse" />
            ))}
          </div>
        ) : (
          <LostFoundGallery
            items={items}
            isAdmin={isSuperAdmin || isAdmin}
            onClaimItem={handleOpenClaimWizard}
          />
        )}
      </main>

      {/* Claim Wizard Modal */}
      <ClaimWizardModal
        isOpen={isClaimWizardOpen}
        onClose={() => setIsClaimWizardOpen(false)}
        item={selectedClaimItem}
        onClaimSubmitted={() => fetchItems()}
      />

      {/* Report Found Item Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card p-6 space-y-5 bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Report Found Item
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[var(--text-secondary)]">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Blue HP Laptop Charger"
                  className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Documents">Documents / ID Cards</option>
                    <option value="Personal Items">Personal Items</option>
                    <option value="Clothing">Clothing / Accessories</option>
                    <option value="Keys">Keys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--text-secondary)]">
                    Found Date
                  </label>
                  <input
                    type="date"
                    required
                    value={foundDate}
                    onChange={(e) => setFoundDate(e.target.value)}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[var(--text-secondary)]">
                  Found Location
                </label>
                <input
                  type="text"
                  required
                  value={foundLocation}
                  onChange={(e) => setFoundLocation(e.target.value)}
                  placeholder="e.g. Library 2nd Floor Study Table"
                  className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Hidden Verification Info (Admin Only)</span>
                  <span className="text-[10px] text-amber-400 font-normal">
                    Used to verify claims
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={hiddenDetails}
                  onChange={(e) => setHiddenDetails(e.target.value)}
                  placeholder="e.g. Has yellow tape near plug, scratch on back, contains initial 'RK'..."
                  className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  Item Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:opacity-90"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20 hover:bg-indigo-500"
                >
                  {isSubmitting ? 'Submitting...' : 'Report Found Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
