'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Award, Lock, Sparkles, Star } from 'lucide-react';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.gamification.achievements();
      setAchievements(res.achievements || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load achievements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const categories = ['habits', 'focus', 'streak', 'xp', 'level', 'special'];

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Achievements</h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          Unlock badges and earn XP by reaching milestones in your journey.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
          <Award className="w-8 h-8 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Overall Completion</h3>
              <p className="text-xs text-slate-500 font-medium">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
            <span className="text-lg font-extrabold text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievements by Category */}
      <div className="space-y-10">
        {categories.map((category) => {
          const catAchievements = achievements.filter((a) => a.category === category);
          if (catAchievements.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h2 className="font-bold text-lg text-slate-800 capitalize flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {category} Milestones
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catAchievements.map((achievement) => (
                  <div
                    key={achievement._id}
                    className={`p-5 rounded-xl border transition-all ${
                      achievement.unlocked
                        ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        : 'bg-slate-50 border-slate-100 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                          achievement.unlocked
                            ? 'bg-indigo-50 border-indigo-100'
                            : 'bg-slate-100 border-slate-200 grayscale opacity-50'
                        }`}
                      >
                        {achievement.icon || '🏆'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm text-slate-800 truncate">
                            {achievement.name}
                          </h4>
                          {!achievement.unlocked && (
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                        
                        <p className="text-[11px] text-slate-500 leading-snug mb-3">
                          {achievement.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              achievement.unlocked
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {achievement.rarity || 'common'}
                          </span>

                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${achievement.unlocked ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                            <span className={`text-xs font-extrabold ${achievement.unlocked ? 'text-amber-600' : 'text-slate-500'}`}>
                              +{achievement.xpReward} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
