'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Radio,
  Pin,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  FileText,
  AlertCircle,
  Eye,
  Calendar,
  X,
} from 'lucide-react';
import { Notice, NoticeCategory, NoticePriority } from '@/types/notice';
import {
  getAllNotices,
  saveNotice,
  deleteNotice,
  toggleNoticePublished,
  toggleNoticePinned,
} from '@/lib/notices';
import { toast } from 'sonner';

export function NoticeBoardManagement() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: NoticeCategory;
    priority: NoticePriority;
    published: boolean;
    pinned: boolean;
    attachmentUrl: string;
  }>({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    published: true,
    pinned: false,
    attachmentUrl: '',
  });

  const loadData = useCallback(() => {
    const list = getAllNotices();
    setNotices(list);
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) loadData();
    });
    const handleUpdate = () => loadData();
    window.addEventListener('campus-notices-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('campus-notices-updated', handleUpdate);
    };
  }, [loadData]);

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      description: '',
      category: 'GENERAL',
      priority: 'NORMAL',
      published: true,
      pinned: false,
      attachmentUrl: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      category: notice.category,
      priority: notice.priority,
      published: notice.published,
      pinned: notice.pinned,
      attachmentUrl: notice.attachmentUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and Description are required');
      return;
    }

    try {
      saveNotice({
        ...(editingNotice ? { id: editingNotice.id } : {}),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        published: formData.published,
        pinned: formData.pinned,
        createdBy: 'SUPER ADMIN',
        attachmentUrl: formData.attachmentUrl.trim() || undefined,
      });

      toast.success(
        editingNotice ? 'Notice updated successfully!' : 'Notice published to Campus Board!'
      );
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notice');
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete notice: "${title}"?`)) {
      deleteNotice(id);
      toast.success('Notice deleted');
      loadData();
    }
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    toggleNoticePublished(id);
    toast.success(currentStatus ? 'Notice unpublished' : 'Notice published live');
    loadData();
  };

  const handleTogglePin = (id: string, currentPinned: boolean) => {
    toggleNoticePinned(id);
    toast.success(currentPinned ? 'Notice unpinned' : 'Notice pinned to top');
    loadData();
  };

  const filtered = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = notices.filter((n) => n.published).length;
  const pinnedCount = notices.filter((n) => n.pinned && n.published).length;
  const draftCount = notices.filter((n) => !n.published).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-xl font-display font-bold text-white">
              Campus Notice Board Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Super Admin Portal • Central Broadcast Control
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition-colors shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          CREATE NEW NOTICE
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            ACTIVE PUBLISHED NOTICES
          </span>
          <span className="text-2xl font-bold font-mono text-cyan-400">{activeCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            PINNED TO HERO BOARD
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400">{pinnedCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            UNPUBLISHED DRAFTS
          </span>
          <span className="text-2xl font-bold font-mono text-purple-400">{draftCount}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search notices by title, category, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-sans"
        />
      </div>

      {/* Notices Table / Card List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded-2xl">
            No notices match your criteria.
          </div>
        ) : (
          filtered.map((notice) => (
            <div
              key={notice.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-cyan-500/30">
                    {notice.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      notice.priority === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : notice.priority === 'HIGH'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {notice.priority}
                  </span>
                  {notice.published ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> PUBLISHED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500">
                      <XCircle className="w-3 h-3" /> DRAFT
                    </span>
                  )}
                  {notice.pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400">
                      <Pin className="w-3 h-3 fill-amber-400" /> PINNED
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-white">{notice.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{notice.description}</p>
              </div>

              {/* Actions Button Bar */}
              <div className="flex items-center gap-2 self-end md:self-auto text-xs font-mono">
                <button
                  onClick={() => handleTogglePin(notice.id, notice.pinned)}
                  title={notice.pinned ? 'Unpin' : 'Pin to top'}
                  className={`p-2 rounded-lg border transition-colors ${
                    notice.pinned
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleTogglePublish(notice.id, notice.published)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    notice.published
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}
                >
                  {notice.published ? 'UNPUBLISH' : 'PUBLISH'}
                </button>

                <button
                  onClick={() => openEditModal(notice)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(notice.id, notice.title)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white font-display">
                  {editingNotice ? 'Edit Notice' : 'Create New Broadcast Notice'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">NOTICE TITLE *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. End Semester Examination Schedule"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-sm font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">CATEGORY</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as NoticeCategory })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="GENERAL">GENERAL</option>
                      <option value="IMPORTANT">IMPORTANT</option>
                      <option value="EVENT">EVENT</option>
                      <option value="URGENT">URGENT</option>
                      <option value="ACADEMIC">ACADEMIC</option>
                      <option value="EXAMINATION">EXAMINATION</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">PRIORITY</label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value as NoticePriority })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="LOW">LOW</option>
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">NOTICE DESCRIPTION *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full notice details..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">DOCUMENT / ATTACHMENT URL (OPTIONAL)</label>
                  <input
                    type="text"
                    value={formData.attachmentUrl}
                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                    placeholder="e.g. /docs/exam-schedule.pdf or https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-400 focus:ring-0"
                    />
                    <span>Publish Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.pinned}
                      onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                      className="rounded border-slate-800 bg-slate-950 text-amber-400 focus:ring-0"
                    />
                    <span>Pin to Top</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                  >
                    {editingNotice ? 'SAVE CHANGES' : 'PUBLISH NOTICE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
