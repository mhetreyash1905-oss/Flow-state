'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import {
  Timer as TimerIcon,
  Play,
  Square,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  TrendingUp,
  Brain,
  Coffee,
  ListRestart,
  Loader2,
} from 'lucide-react';

export default function FocusPage() {
  const { data: session, update: updateSession } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Start Form States
  const [type, setType] = useState<'pomodoro' | 'deepwork' | 'custom'>('pomodoro');
  const [duration, setDuration] = useState(25);
  const [label, setLabel] = useState('');
  const [startLoading, setStartLoading] = useState(false);

  // Active Session Timer States
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, statsRes] = await Promise.all([
        api.focus.list(1, 10),
        api.focus.stats(),
      ]);
      setSessions(sessionsRes.sessions);
      setStats(statsRes.stats);
      
      const active = statsRes.stats.activeSession;
      if (active) {
        setActiveSession(active);
        calculateRemainingTime(active);
      } else {
        setActiveSession(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load focus sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate remaining seconds based on server start time (handles page refreshes!)
  const calculateRemainingTime = (sessionObj: any) => {
    const startedAt = new Date(sessionObj.startedAt).getTime();
    const totalSeconds = sessionObj.duration * 60;
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const remaining = Math.max(0, totalSeconds - elapsedSeconds);
    setSecondsLeft(remaining);
    
    if (remaining === 0) {
      // Session automatically completed in theory, but let user submit
      setIsPaused(false);
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (activeSession && secondsLeft > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, secondsLeft, isPaused]);

  // Handle Preset Clicks
  const handleTypeChange = (selectedType: 'pomodoro' | 'deepwork' | 'custom') => {
    setType(selectedType);
    if (selectedType === 'pomodoro') setDuration(25);
    else if (selectedType === 'deepwork') setDuration(50);
    else setDuration(15);
  };

  // Start Focus Session
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartLoading(true);
    try {
      const res = await api.focus.start({
        type,
        duration,
        label: label.trim() || undefined,
      });
      setActiveSession(res.session);
      setSecondsLeft(res.session.duration * 60);
      setInterruptions(0);
      setNotes('');
      setIsPaused(false);
    } catch (err: any) {
      alert(err.message || 'Failed to start focus session.');
    } finally {
      setStartLoading(false);
    }
  };

  // End Focus Session (Complete / Cancel)
  const handleEndSession = async (status: 'completed' | 'cancelled') => {
    if (!activeSession) return;
    setSubmitLoading(true);

    try {
      const startedAt = new Date(activeSession.startedAt).getTime();
      const elapsedMinutes = Math.round((Date.now() - startedAt) / 60000);
      const actualDuration = status === 'completed' 
        ? Math.min(activeSession.duration, Math.max(1, elapsedMinutes))
        : 0;

      const res = await api.focus.update(activeSession._id, {
        status,
        actualDuration,
        interruptions,
        notes: notes.trim() || undefined,
      });

      // Update XP & levels session context if earned
      if (res.session.xpEarned > 0 && res.session.status === 'completed') {
        const xpAmount = res.session.xpEarned;
        const newXP = (session?.user?.xp || 0) + xpAmount;
        // Centralized level calculation update
        const getXPForLevel = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));
        let level = session?.user?.level || 1;
        while (getXPForLevel(level + 1) <= newXP) {
          level++;
        }
        
        await updateSession({
          xp: newXP,
          level,
        });
      }

      // Reload lists and reset timers
      setActiveSession(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update focus session.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      {/* Header bar */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Focus Center</h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">
          Drown out distractions. Dedicate time blocks for deep learning and work.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timer Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeSession ? (
            /* Active Session Timer Widget */
            <div className="bg-slate-900 rounded-2xl p-8 text-white border border-slate-800 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

              {/* Progress Tracker Title */}
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
                <Brain className="w-3.5 h-3.5" />
                <span>Focusing: {activeSession.label || activeSession.type}</span>
              </div>

              {/* Countdown Ticker */}
              <div className="text-7xl sm:text-8xl font-black tracking-tight mb-8 font-mono select-none">
                {formatTime(secondsLeft)}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-4 w-full max-w-sm mb-8">
                {/* Pause/Resume */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`flex-1 min-w-[120px] py-3 rounded-xl text-xs font-bold transition-all border ${
                    isPaused
                      ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>

                {/* Complete Session */}
                <button
                  onClick={() => handleEndSession('completed')}
                  disabled={submitLoading}
                  className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                >
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Complete</span>
                    </>
                  )}
                </button>

                {/* Cancel Session */}
                <button
                  onClick={() => handleEndSession('cancelled')}
                  disabled={submitLoading}
                  className="py-3 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 transition-colors"
                >
                  Discard
                </button>
              </div>

              {/* In-Session Logs (Interruptions & Notes) */}
              <div className="w-full max-w-md border-t border-slate-800 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Interruptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInterruptions(Math.max(0, interruptions - 1))}
                      className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-200 hover:bg-slate-750"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm text-slate-100 min-w-[20px] text-center">
                      {interruptions}
                    </span>
                    <button
                      onClick={() => setInterruptions(interruptions + 1)}
                      className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-200 hover:bg-slate-750"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Session Notes</span>
                  </label>
                  <textarea
                    placeholder="What did you work on? Jot down any breakthroughs..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Start New Session Form */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <TimerIcon className="w-4 h-4 text-indigo-600" />
                <span>Initialize Work Interval</span>
              </h3>

              <form onSubmit={handleStart} className="space-y-5">
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Focus Mode Preset
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('pomodoro')}
                      className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        type === 'pomodoro'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span>Pomodoro (25m)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('deepwork')}
                      className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        type === 'deepwork'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Deep Work (50m)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('custom')}
                      className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        type === 'custom'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Coffee className="w-4 h-4" />
                      <span>Custom Time</span>
                    </button>
                  </div>
                </div>

                {/* Duration Slider (only show for Custom or always as adjustment) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Block Duration</span>
                    <span className="text-slate-700 font-extrabold">{duration} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Session Label */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="label">
                    Activity Label (Optional)
                  </label>
                  <input
                    id="label"
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Debugging Mongoose queries..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-700 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={startLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-505 disabled:bg-indigo-600/50 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {startLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Initialize Flow State</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Past Sessions List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Interval History</span>
            </h3>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No past focus intervals logged yet. Complete a session to see it here!
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">
                        {item.label || item.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        {new Date(item.startedAt).toLocaleDateString()} at{' '}
                        {new Date(item.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {item.actualDuration}m completed
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'completed' ? (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                          +{item.xpEarned} XP
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          Discarded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats Panel */}
        {stats && (
          <div className="space-y-6">
            {/* All-time Stats */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Aggregated Analytics</span>
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">All-Time Focus Duration</span>
                  <span className="font-extrabold text-slate-700">{stats.allTime.totalMinutes} min</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">All-Time Completed Blocks</span>
                  <span className="font-extrabold text-slate-700">{stats.allTime.totalSessions} sessions</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Average Interval Length</span>
                  <span className="font-extrabold text-slate-700">{stats.allTime.avgDuration} min</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Total Interruptions Logged</span>
                  <span className="font-extrabold text-slate-700">{stats.allTime.totalInterruptions} times</span>
                </div>
              </div>
            </div>

            {/* Weekly vs Today Stats */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Current Velocity</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Today</span>
                  <span className="text-lg font-black text-indigo-600 block mt-1">
                    {stats.today.totalMinutes}m
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {stats.today.totalSessions} sessions
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Past 7 Days</span>
                  <span className="text-lg font-black text-purple-600 block mt-1">
                    {stats.weekly.totalMinutes}m
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {stats.weekly.totalSessions} sessions
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
