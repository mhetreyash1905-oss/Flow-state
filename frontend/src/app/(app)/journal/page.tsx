'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { BookOpen, Plus, Search, Filter, Trash2, Edit3, Calendar } from 'lucide-react';

export default function JournalPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [tags, setTags] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.journal.list();
      setEntries(res.entries || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError('Content is required');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await api.journal.create({
        content,
        mood,
        energy,
        tags: tagArray,
      });

      setEntries((prev) => [res.entry, ...prev]);
      setShowForm(false);
      setContent('');
      setMood(3);
      setEnergy(3);
      setTags('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create entry.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.journal.delete(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry.');
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Journal</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Reflect on your progress, document your thoughts, and track your mood.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-slate-800">No entries yet</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              Start journaling to keep track of your daily reflections and insights.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry._id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {formatDateTime(entry.date || entry.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 mb-6 whitespace-pre-wrap">
                {entry.content}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mood:</span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {entry.mood}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Energy:</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      {entry.energy}/5
                    </span>
                  </div>
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-2xl w-full shadow-2xl flex flex-col relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg text-slate-800 mb-2">New Journal Entry</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              Record your thoughts, progress, and daily reflections.
            </p>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded-lg font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reflection Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? What did you accomplish today?"
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-3 text-sm text-slate-700 outline-none transition-all resize-y"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mood (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Terrible</span>
                    <span className="text-indigo-600">{mood}/5</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Energy (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Drained</span>
                    <span className="text-amber-500">{energy}/5</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. learning, productivity, tired"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-colors"
                >
                  {formLoading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
