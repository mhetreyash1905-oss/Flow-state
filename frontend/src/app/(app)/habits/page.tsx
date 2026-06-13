'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import {
  Plus,
  Check,
  Archive,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Flame,
  Award,
  Circle,
  HelpCircle,
} from 'lucide-react';

export default function HabitsPage() {
  const { data: session, update: updateSession } = useSession();
  const [habits, setHabits] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for creating custom habit
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('productivity');
  const [frequency, setFrequency] = useState('daily');
  const [difficulty, setDifficulty] = useState('medium');
  const [targetCount, setTargetCount] = useState(1);
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('Circle');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsRes, templatesRes] = await Promise.all([
        api.habits.list(),
        api.habits.templates(),
      ]);
      setHabits(habitsRes.habits);
      setTemplates(templatesRes.templates);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load habits data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (habitId: string) => {
    try {
      const result = await api.habits.complete(habitId);
      
      // Update habit states locally
      setHabits((prev) =>
        prev.map((h) => {
          if (h._id === habitId) {
            const completedCount = h.completedToday + 1;
            return {
              ...h,
              completedToday: completedCount,
              isCompletedToday: completedCount >= h.targetCount,
            };
          }
          return h;
        })
      );

      // Trigger session update to fetch latest level/XP
      if (result.xp) {
        await updateSession({
          xp: result.xp.newXP,
          level: result.xp.newLevel,
          title: result.xp.newTitle,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete habit');
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm('Are you sure you want to archive this habit?')) return;
    try {
      await api.habits.delete(habitId);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
    } catch (err: any) {
      alert(err.message || 'Failed to archive habit');
    }
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const result = await api.habits.create({
        name,
        description,
        category,
        frequency,
        difficulty,
        targetCount,
        color,
        icon,
      });

      setHabits((prev) => [
        { ...result, completedToday: 0, isCompletedToday: false },
        ...prev,
      ]);

      // Reset form
      setName('');
      setDescription('');
      setCategory('productivity');
      setFrequency('daily');
      setDifficulty('medium');
      setTargetCount(1);
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create habit');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    try {
      const result = await api.habits.createFromTemplate(templateId);
      setHabits((prev) => [
        { ...result, completedToday: 0, isCompletedToday: false },
        ...prev,
      ]);
    } catch (err: any) {
      alert(err.message || 'Failed to add habit from template.');
    }
  };

  const filteredHabits = habits.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || h.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Your Habits</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Form long-term consistency by ticking off goals daily.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 shrink-0 align-self-start sm:align-self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Habit</span>
        </button>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Habits list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-xs outline-none text-slate-700 placeholder-slate-400"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg text-xs appearance-none outline-none font-medium text-slate-700"
                >
                  <option value="all">All Categories</option>
                  <option value="health">Health</option>
                  <option value="productivity">Productivity</option>
                  <option value="learning">Learning</option>
                  <option value="fitness">Fitness</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="creativity">Creativity</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Habit cards grid */}
          {filteredHabits.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center shadow-sm">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-slate-800">No habits found</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                Start by creating a custom habit or choosing from templates on the right panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredHabits.map((habit) => (
                <div
                  key={habit._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Category Accent top bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: habit.color || '#3b82f6' }}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{habit.name}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-slate-100 text-slate-600">
                          {habit.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {habit.description || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-5">
                      <span>{habit.category}</span>
                      <span>•</span>
                      <span>{habit.frequency}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Progress</span>
                      <span className="text-xs font-extrabold text-slate-700 mt-0.5">
                        {habit.completedToday} / {habit.targetCount}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {/* Archive Button */}
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors shrink-0"
                        title="Archive Habit"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      {/* Complete Checkbox Button */}
                      <button
                        onClick={() => handleComplete(habit._id)}
                        disabled={habit.isCompletedToday}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          habit.isCompletedToday
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10'
                        }`}
                      >
                        {habit.isCompletedToday ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Log ({habit.xpReward} XP)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Templates */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Habit Templates</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Instantly populate your checklist with proven behavioral architectures.
              </p>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="flex items-start justify-between gap-3 pt-3 first:pt-0"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-700 block truncate">
                      {template.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {template.description}
                    </span>
                    <div className="flex gap-1.5 items-center mt-1 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>{template.category}</span>
                      <span>•</span>
                      <span>{template.difficulty}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateFromTemplate(template._id)}
                    className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-colors shrink-0"
                    title="Add Habit"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Custom Habit Creation */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-2xl flex flex-col relative">
            <h3 className="font-extrabold text-lg text-slate-800 mb-2">Create Custom Habit</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              Configure parameters to calculate custom XP scaling.
            </p>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded-lg font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Habit Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Morning Cardio"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why this habit is important..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none appearance-none"
                  >
                    <option value="productivity">Productivity</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="fitness">Fitness</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="creativity">Creativity</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none appearance-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Difficulty (XP Scaled)</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none appearance-none"
                  >
                    <option value="easy">Easy (10 XP)</option>
                    <option value="medium">Medium (25 XP)</option>
                    <option value="hard">Hard (50 XP)</option>
                    <option value="extreme">Extreme (100 XP)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Completions/Day</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={targetCount}
                    onChange={(e) => setTargetCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hex Color Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-250 cursor-pointer overflow-hidden p-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 text-xs text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-505 disabled:bg-indigo-600/50 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-colors"
                >
                  {formLoading ? 'Creating...' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
