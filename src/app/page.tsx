"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Droplets, Plus, RotateCcw, Trophy, Info, X, Settings, 
  History, ChevronRight, User, Activity, Flame, BarChart3, 
  Coffee, Wine, GlassWater, CupSoda
} from "lucide-react";

// --- TYPES ---
type DrinkType = 'Water' | 'Coffee' | 'Tea' | 'Soda' | 'Juice';

type LogItem = {
  id: string;
  amount: number; // The actual volume drunk
  hydratedAmount: number; // The effective hydration
  type: DrinkType;
  time: string;
  timestamp: number;
};

type UserSettings = {
  name: string;
  weight: number; // in kg
  activityLevel: 'Low' | 'Moderate' | 'High';
  manualGoal: number;
  useSmartGoal: boolean;
  theme: 'Ocean' | 'Forest' | 'Berry'; // For future expansion, currently Ocean default
};

type DayStat = {
  date: string;
  amount: number;
};

// --- CONSTANTS ---
const DRINK_TYPES: { type: DrinkType; label: string; icon: any; hydrationFactor: number; color: string }[] = [
  { type: 'Water', label: 'Water', icon: GlassWater, hydrationFactor: 1.0, color: 'text-cyan-400' },
  { type: 'Coffee', label: 'Coffee', icon: Coffee, hydrationFactor: 0.85, color: 'text-amber-400' }, // Coffee is less hydrating
  { type: 'Tea', label: 'Tea', icon: CupSoda, hydrationFactor: 0.9, color: 'text-orange-300' },
  { type: 'Soda', label: 'Soda', icon: Wine, hydrationFactor: 0.6, color: 'text-purple-400' }, // Sugary drinks are bad for hydration
  { type: 'Juice', label: 'Juice', icon: Droplets, hydrationFactor: 0.95, color: 'text-yellow-400' },
];

const BADGES = [
  { id: 'streak_3', name: '3 Day Streak', icon: '🔥', desc: 'Hit goal 3 days in a row' },
  { id: 'streak_7', name: 'Hydration Hero', icon: '⚡', desc: 'Hit goal 7 days in a row' },
  { id: 'high_vol', name: 'Camel Mode', icon: '🐪', desc: 'Drank over 4000ml in a day' },
];

// --- COMPONENTS ---

// 1. WAVE ANIMATION COMPONENT
const WaveProgress = ({ percentage }: { percentage: number }) => {
  const clampPercent = Math.min(Math.max(percentage, 0), 100);
  // Calculate height: 100% is top (0), 0% is bottom (100)
  const yOffset = 100 - clampPercent;

  return (
    <div className="relative w-64 h-64 rounded-full border-4 border-white/10 bg-slate-900/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Background/Empty State */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center">
          <motion.span 
            key={Math.round(percentage)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black text-white drop-shadow-md"
          >
            {Math.round(percentage)}<span className="text-2xl text-cyan-400">%</span>
          </motion.span>
        </div>
      </div>

      {/* The Liquid Wave */}
      <motion.div 
        className="absolute bottom-0 left-[-50%] w-[200%] h-[200%] bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-400 opacity-80"
        animate={{ 
          y: `${yOffset - 100}%`, // Move up/down based on percentage
          rotate: [0, 360] // Rotate to create wave effect
        }}
        transition={{ 
          y: { duration: 1.5, ease: "easeInOut" },
          rotate: { duration: 10, repeat: Infinity, ease: "linear" }
        }}
        style={{ 
          borderRadius: '40%', // Makes it look like a wave when rotating
        }}
      />
      
      {/* Glossy Overlay Reflection */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-30" />
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function JalsaAdvanced() {
  // State
  const [isMounted, setIsMounted] = useState(false);
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState<LogItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    name: 'guest',
    weight: 70,
    activityLevel: 'Moderate',
    manualGoal: 3000,
    useSmartGoal: true,
    theme: 'Ocean'
  });
  const [streak, setStreak] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<DayStat[]>([]);
  
  // UI Panels
  const [activeTab, setActiveTab] = useState<'Home' | 'Stats' | 'Settings'>('Home');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Load Data
  useEffect(() => {
    setIsMounted(true);
    const savedIntake = localStorage.getItem("jalsa_intake");
    const savedHistory = localStorage.getItem("jalsa_history");
    const savedSettings = localStorage.getItem("jalsa_settings");
    const savedDate = localStorage.getItem("jalsa_date");
    const savedStreak = localStorage.getItem("jalsa_streak");
    const savedStats = localStorage.getItem("jalsa_stats");
    const savedBadges = localStorage.getItem("jalsa_badges");

    const today = new Date().toLocaleDateString();

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedStats) setWeeklyStats(JSON.parse(savedStats));
    if (savedBadges) setUnlockedBadges(JSON.parse(savedBadges));

    // Day Reset Logic
    if (savedDate !== today) {
        // It's a new day!
        if (savedDate) {
            // Save yesterday's data to stats
            const yesterdayIntake = parseInt(savedIntake || "0");
            const yesterdayGoal = parseInt(localStorage.getItem("jalsa_last_goal") || "3000");
            
            // Check streak
            if (yesterdayIntake >= yesterdayGoal) {
                setStreak(prev => prev + 1);
            } else {
                setStreak(0);
            }

            // Add to stats
            const newStat: DayStat = { date: savedDate, amount: yesterdayIntake };
            setWeeklyStats(prev => [...prev.slice(-6), newStat]); // Keep last 7 days
        }
        
        setIntake(0);
        setHistory([]);
        localStorage.setItem("jalsa_date", today);
    } else {
        if (savedIntake) setIntake(parseInt(savedIntake));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Calculate Goal
  const dailyGoal = useMemo(() => {
    if (!settings.useSmartGoal) return settings.manualGoal;
    
    // Smart Formula: Weight(kg) * 35ml + Activity Bonus
    let base = settings.weight * 35;
    if (settings.activityLevel === 'Moderate') base += 500;
    if (settings.activityLevel === 'High') base += 1000;
    return Math.round(base / 100) * 100; // Round to nearest 100
  }, [settings]);

  // Persist Data
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("jalsa_intake", intake.toString());
      localStorage.setItem("jalsa_history", JSON.stringify(history));
      localStorage.setItem("jalsa_settings", JSON.stringify(settings));
      localStorage.setItem("jalsa_last_goal", dailyGoal.toString());
      localStorage.setItem("jalsa_streak", streak.toString());
      localStorage.setItem("jalsa_stats", JSON.stringify(weeklyStats));
      localStorage.setItem("jalsa_badges", JSON.stringify(unlockedBadges));
    }
  }, [intake, history, settings, streak, weeklyStats, unlockedBadges, isMounted, dailyGoal]);

  // Logic: Add Water
  const handleAddDrink = (amount: number, type: DrinkType) => {
    const drinkData = DRINK_TYPES.find(d => d.type === type);
    const hydrationFactor = drinkData ? drinkData.hydrationFactor : 1;
    const effectiveAmount = Math.round(amount * hydrationFactor);

    // Haptic Feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
    }

    const newIntake = intake + effectiveAmount;
    setIntake(newIntake);

    const newLog: LogItem = {
        id: Date.now().toString(),
        amount: amount,
        hydratedAmount: effectiveAmount,
        type: type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    };
    
    setHistory(prev => [newLog, ...prev]);
    setShowAddMenu(false);

    // Celebration
    if (intake < dailyGoal && newIntake >= dailyGoal) {
        triggerConfetti();
        // Check High Vol Badge
        if (!unlockedBadges.includes('high_vol') && newIntake >= 4000) {
            setUnlockedBadges(prev => [...prev, 'high_vol']);
            alert("🏆 Achievement Unlocked: Camel Mode!");
        }
    }
  };

  const triggerConfetti = () => {
    const end = Date.now() + 1500;
    const colors = ['#22d3ee', '#3b82f6', '#ffffff'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const percentage = Math.min((intake / dailyGoal) * 100, 100);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#0b1121] flex items-center justify-center p-0 md:p-4 font-sans text-slate-100 overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* --- MAIN CARD --- */}
      <motion.div 
        layout
        className="relative z-10 w-full max-w-[420px] h-[100dvh] md:h-auto md:min-h-[800px] bg-slate-900/40 backdrop-blur-3xl md:border border-white/10 md:rounded-[45px] shadow-2xl flex flex-col overflow-hidden"
      >
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 pb-2">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                   Hello, {settings.name}
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                   <Flame className="w-3 h-3 text-orange-500" /> {streak} Day Streak
                </p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('Stats')} className={`p-3 rounded-full transition ${activeTab === 'Stats' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                    <BarChart3 className="w-5 h-5" />
                </button>
                <button onClick={() => setActiveTab('Settings')} className={`p-3 rounded-full transition ${activeTab === 'Settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 relative overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
                
                {/* --- TAB: HOME --- */}
                {activeTab === 'Home' && (
                    <motion.div 
                        key="home"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col items-center pt-4 pb-24 px-6"
                    >
                        {/* Progress Circle */}
                        <div className="mt-4 mb-8 relative">
                             <WaveProgress percentage={percentage} />
                             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-white/10 px-4 py-1 rounded-full text-xs text-cyan-300 whitespace-nowrap">
                                Goal: {dailyGoal}ml
                             </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 w-full mb-8">
                             <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                 <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Intake</span>
                                 <span className="text-2xl font-bold text-white">{intake}<span className="text-sm text-slate-500 font-normal">ml</span></span>
                             </div>
                             <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                 <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Remaining</span>
                                 <span className="text-2xl font-bold text-blue-200">{Math.max(0, dailyGoal - intake)}<span className="text-sm text-slate-500 font-normal">ml</span></span>
                             </div>
                        </div>

                        {/* Recent History Preview */}
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-slate-300">Today's Logs</h3>
                                <span className="text-xs text-slate-500">{history.length} records</span>
                            </div>
                            <div className="space-y-3">
                                {history.length === 0 ? (
                                    <div className="text-center py-8 text-slate-600 text-sm">No drinks logged yet. Hydrate! 💧</div>
                                ) : (
                                    history.slice(0, 3).map(log => (
                                        <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-800 rounded-full">
                                                    {DRINK_TYPES.find(d => d.type === log.type)?.icon && React.createElement(DRINK_TYPES.find(d => d.type === log.type)!.icon, { className: "w-4 h-4 text-cyan-400" })}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{log.type}</p>
                                                    <p className="text-[10px] text-slate-500">{log.time}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-cyan-300">+{log.hydratedAmount}ml</p>
                                                {log.hydratedAmount !== log.amount && (
                                                    <p className="text-[10px] text-slate-500 line-through">{log.amount}ml</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {history.length > 3 && (
                                    <button onClick={() => setActiveTab('Stats')} className="w-full text-center text-xs text-blue-400 mt-2">View all history</button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- TAB: STATS --- */}
                {activeTab === 'Stats' && (
                    <motion.div 
                        key="stats"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 pb-24"
                    >
                         <h2 className="text-2xl font-bold mb-6">Statistics</h2>
                         
                         {/* Weekly Chart */}
                         <div className="bg-slate-800/50 p-5 rounded-3xl mb-6">
                            <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Last 7 Days</h3>
                            <div className="h-40 flex items-end justify-between gap-2">
                                {weeklyStats.length === 0 && <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Start logging to see stats!</div>}
                                {weeklyStats.slice(-7).map((stat, i) => {
                                    const hPercent = Math.min((stat.amount / dailyGoal) * 100, 100);
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                            <div className="w-full bg-slate-700/50 rounded-t-lg relative group h-full flex items-end overflow-hidden">
                                                <motion.div 
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${hPercent}%` }}
                                                    className={`w-full ${hPercent >= 100 ? 'bg-green-400' : 'bg-cyan-500'} opacity-80`}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-500">{stat.date.split('/')[0]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                         </div>

                         {/* Badges Grid */}
                         <h3 className="text-sm text-slate-400 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4"/> Achievements</h3>
                         <div className="grid grid-cols-3 gap-3">
                             {BADGES.map(badge => {
                                 const isUnlocked = unlockedBadges.includes(badge.id);
                                 return (
                                     <div key={badge.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border ${isUnlocked ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-500/50' : 'bg-white/5 border-white/5 grayscale opacity-50'}`}>
                                         <span className="text-2xl mb-2">{badge.icon}</span>
                                         <span className={`text-[10px] font-bold ${isUnlocked ? 'text-amber-200' : 'text-slate-500'}`}>{badge.name}</span>
                                     </div>
                                 )
                             })}
                         </div>
                    </motion.div>
                )}

                {/* --- TAB: SETTINGS --- */}
                {activeTab === 'Settings' && (
                     <motion.div 
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 pb-24 space-y-6"
                    >
                        <h2 className="text-2xl font-bold">Preferences</h2>
                        
                        {/* Profile Section */}
                        <div className="bg-white/5 p-5 rounded-3xl space-y-4 border border-white/5">
                             <div className="flex items-center gap-3 mb-2">
                                 <div className="p-2 bg-blue-500 rounded-lg"><User className="w-5 h-5 text-white" /></div>
                                 <h3 className="font-bold">Personal Data</h3>
                             </div>
                             
                             <div>
                                 <label className="text-xs text-slate-400 ml-1">Display Name</label>
                                 <input 
                                    type="text" 
                                    value={settings.name} 
                                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-cyan-500 transition"
                                 />
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-xs text-slate-400 ml-1">Weight (kg)</label>
                                    <input 
                                        type="number" 
                                        value={settings.weight} 
                                        onChange={(e) => setSettings({...settings, weight: parseInt(e.target.value) || 0})}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-cyan-500"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs text-slate-400 ml-1">Activity</label>
                                    <select 
                                        value={settings.activityLevel} 
                                        onChange={(e) => setSettings({...settings, activityLevel: e.target.value as any})}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-cyan-500 appearance-none text-white"
                                    >
                                        <option>Low</option>
                                        <option>Moderate</option>
                                        <option>High</option>
                                    </select>
                                 </div>
                             </div>
                        </div>

                        {/* Goal Section */}
                        <div className="bg-white/5 p-5 rounded-3xl space-y-4 border border-white/5">
                             <div className="flex items-center justify-between mb-2">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500 rounded-lg"><Activity className="w-5 h-5 text-black" /></div>
                                    <h3 className="font-bold">Hydration Goal</h3>
                                 </div>
                                 <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={settings.useSmartGoal} onChange={(e) => setSettings({...settings, useSmartGoal: e.target.checked})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                 </label>
                             </div>

                             {settings.useSmartGoal ? (
                                 <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl">
                                     <p className="text-sm text-cyan-200">
                                         Goal calculated automatically: <span className="font-bold text-white">{dailyGoal}ml</span>
                                     </p>
                                     <p className="text-[10px] text-cyan-200/60 mt-1">Based on {settings.weight}kg & {settings.activityLevel} activity.</p>
                                 </div>
                             ) : (
                                <div>
                                    <label className="text-xs text-slate-400 ml-1">Manual Goal (ml)</label>
                                    <input 
                                        type="number" 
                                        value={settings.manualGoal} 
                                        onChange={(e) => setSettings({...settings, manualGoal: parseInt(e.target.value) || 0})}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                             )}
                        </div>

                        {/* Danger Zone */}
                        <button 
                            onClick={() => {
                                if(confirm("Clear all data? This cannot be undone.")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            className="w-full py-4 text-red-400 bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4"/> Reset App Data
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>

        {/* --- BOTTOM FLOATING BAR (NAVIGATION) --- */}
        <div className="absolute bottom-6 left-6 right-6 z-50">
             <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-[24px] shadow-2xl flex items-center justify-between pl-6 pr-2 h-[72px]">
                 
                 {/* Home Button */}
                 <button onClick={() => setActiveTab('Home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Home' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}>
                     <Droplets className="w-6 h-6 fill-current" />
                 </button>

                 {/* ADD BUTTON (Center) */}
                 <div className="relative -top-6">
                     <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAddMenu(true)}
                        className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] border-4 border-[#0b1121] text-white"
                     >
                         <Plus className="w-8 h-8" strokeWidth={3} />
                     </motion.button>
                 </div>

                 {/* Stats Button */}
                 <button onClick={() => setActiveTab('Stats')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Stats' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}>
                     <History className="w-6 h-6" />
                 </button>
             </div>
        </div>

        {/* --- ADD MENU MODAL --- */}
        <AnimatePresence>
            {showAddMenu && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowAddMenu(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div 
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-[40px] z-50 p-8 pb-10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Add Drink</h3>
                            <button onClick={() => setShowAddMenu(false)} className="p-2 bg-white/10 rounded-full"><X className="w-5 h-5"/></button>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                            {DRINK_TYPES.map(drink => (
                                <button 
                                    key={drink.type}
                                    onClick={() => handleAddDrink(250, drink.type)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition ${drink.color}`}>
                                        <drink.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs text-slate-400">{drink.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <button onClick={() => handleAddDrink(250, 'Water')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                <Plus className="w-5 h-5" /> Quick Add Water (250ml)
                            </button>
                            <button onClick={() => handleAddDrink(500, 'Water')} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                <Trophy className="w-5 h-5 text-yellow-400" /> Add Bottle (500ml)
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}