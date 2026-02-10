"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Droplets, Plus, RotateCcw, Trophy, X, Settings, 
  History, User, Flame, BarChart3, 
  Coffee, Wine, GlassWater, CupSoda, Bell, Send, Smartphone,
  Target, Calculator, LayoutDashboard, Wrench, ChevronUp
} from "lucide-react";

// --- CONFIGURATION (WhatsApp) ---
const WA_INSTANCE = "instance161263"; 
const WA_TOKEN = "llnm6k6wusbr8z5q";

// --- TYPES ---
type DrinkType = 'Water' | 'Coffee' | 'Tea' | 'Soda' | 'Juice';

type LogItem = {
  id: string;
  amount: number; 
  hydratedAmount: number; 
  type: DrinkType;
  time: string;
  timestamp: number;
};

type UserSettings = {
  name: string;
  weight: number; 
  activityLevel: 'Low' | 'Moderate' | 'High';
  manualGoal: number;
  useSmartGoal: boolean;
  phoneNumber: string; 
};

type DayStat = {
  date: string;
  amount: number;
};

// --- CONSTANTS ---
const DRINK_TYPES: { type: DrinkType; label: string; icon: any; hydrationFactor: number; color: string }[] = [
  { type: 'Water', label: 'Water', icon: GlassWater, hydrationFactor: 1.0, color: 'text-cyan-400' },
  { type: 'Coffee', label: 'Coffee', icon: Coffee, hydrationFactor: 0.85, color: 'text-amber-400' }, 
  { type: 'Tea', label: 'Tea', icon: CupSoda, hydrationFactor: 0.9, color: 'text-orange-300' },
  { type: 'Soda', label: 'Soda', icon: Wine, hydrationFactor: 0.6, color: 'text-purple-400' }, 
  { type: 'Juice', label: 'Juice', icon: Droplets, hydrationFactor: 0.95, color: 'text-yellow-400' },
];

const BADGES = [
  { id: 'streak_3', name: '3 Day Streak', icon: '🔥', desc: 'Hit goal 3 days in a row' },
  { id: 'streak_7', name: 'Hydration Hero', icon: '⚡', desc: 'Hit goal 7 days in a row' },
  { id: 'high_vol', name: 'Camel Mode', icon: '🐪', desc: 'Drank over 4000ml in a day' },
];

// --- COMPONENTS ---
const WaveProgress = ({ percentage }: { percentage: number }) => {
  const clampPercent = Math.min(Math.max(percentage, 0), 100);
  const yOffset = 100 - clampPercent;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/10 bg-slate-900/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center">
          <motion.span 
            key={Math.round(percentage)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-white drop-shadow-md"
          >
            {Math.round(percentage)}<span className="text-2xl md:text-3xl text-cyan-400">%</span>
          </motion.span>
        </div>
      </div>
      <motion.div 
        className="absolute bottom-0 left-[-50%] w-[200%] h-[200%] bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-400 opacity-80"
        animate={{ y: `${yOffset - 100}%`, rotate: [0, 360] }}
        transition={{ y: { duration: 1.5, ease: "easeInOut" }, rotate: { duration: 10, repeat: Infinity, ease: "linear" } }}
        style={{ borderRadius: '40%' }}
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-30" />
    </div>
  );
};

// --- MAIN APP ---
export default function JalsaFinal() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Data State
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState<LogItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    name: 'Sanjay',
    weight: 70,
    activityLevel: 'Moderate',
    manualGoal: 3000,
    useSmartGoal: true,
    phoneNumber: ''
  });
  const [streak, setStreak] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<DayStat[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'Home' | 'Stats' | 'Settings'>('Home');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Scroll To Top State (Mobile Only)
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 1. INIT & LOAD
  useEffect(() => {
    setIsMounted(true);
    const today = new Date().toLocaleDateString();
    
    const savedIntake = localStorage.getItem("jalsa_intake");
    const savedDate = localStorage.getItem("jalsa_date");
    
    if (savedDate !== today) {
        if (savedDate) {
            const yesterdayIntake = parseInt(savedIntake || "0");
            const yesterdayGoal = parseInt(localStorage.getItem("jalsa_last_goal") || "3000");
            if (yesterdayIntake >= yesterdayGoal) setStreak(prev => (parseInt(localStorage.getItem("jalsa_streak") || "0")) + 1);
            else setStreak(0);
            
            const savedStats = JSON.parse(localStorage.getItem("jalsa_stats") || "[]");
            const newStat: DayStat = { date: savedDate, amount: yesterdayIntake };
            setWeeklyStats([...savedStats.slice(-6), newStat]);
        }
        setIntake(0);
        setHistory([]);
        localStorage.setItem("jalsa_date", today);
    } else {
        if (savedIntake) setIntake(parseInt(savedIntake));
        if (localStorage.getItem("jalsa_history")) setHistory(JSON.parse(localStorage.getItem("jalsa_history")!));
        if (localStorage.getItem("jalsa_streak")) setStreak(parseInt(localStorage.getItem("jalsa_streak")!));
        if (localStorage.getItem("jalsa_stats")) setWeeklyStats(JSON.parse(localStorage.getItem("jalsa_stats")!));
    }

    if (localStorage.getItem("jalsa_settings")) setSettings(JSON.parse(localStorage.getItem("jalsa_settings")!));
    if (localStorage.getItem("jalsa_badges")) setUnlockedBadges(JSON.parse(localStorage.getItem("jalsa_badges")!));
  }, []);

  // Scroll Listener for Mobile
  useEffect(() => {
    const div = mobileContainerRef.current;
    if (!div) return;

    const handleScroll = () => {
      // Show button if scrolled down more than 300px
      if (div.scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    div.addEventListener('scroll', handleScroll);
    return () => div.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  const scrollToTop = () => {
    if (mobileContainerRef.current) {
      mobileContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 2. CALC GOAL
  const dailyGoal = useMemo(() => {
    if (!settings.useSmartGoal) return settings.manualGoal;
    let base = settings.weight * 35; 
    if (settings.activityLevel === 'Moderate') base += 500;
    if (settings.activityLevel === 'High') base += 1000;
    return Math.round(base / 100) * 100;
  }, [settings]);

  // 3. SAVE
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

  // --- ACTIONS ---
  const handleAddDrink = (amount: number, type: DrinkType) => {
    const drinkData = DRINK_TYPES.find(d => d.type === type);
    const hydrationFactor = drinkData ? drinkData.hydrationFactor : 1;
    const effectiveAmount = Math.round(amount * hydrationFactor);

    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);

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

    if (intake < dailyGoal && newIntake >= dailyGoal) triggerConfetti();
    if (!unlockedBadges.includes('high_vol') && newIntake >= 4000) {
        setUnlockedBadges(prev => [...prev, 'high_vol']);
        alert("🏆 Achievement Unlocked: Camel Mode!");
    }
  };

  // --- TESTING FUNCTIONS ---
  const simulateStreak = (days: number) => {
      setStreak(days);
      const newBadges = [...unlockedBadges];
      if (days >= 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3');
      if (days >= 7 && !newBadges.includes('streak_7')) newBadges.push('streak_7');
      
      setUnlockedBadges(newBadges);
      triggerConfetti();
      alert(`✅ Simulated ${days}-Day Streak! Check Analytics tab.`);
  };

  const simulateHighVolume = () => {
      setIntake(4500);
      if (!unlockedBadges.includes('high_vol')) {
          setUnlockedBadges(prev => [...prev, 'high_vol']);
      }
      triggerConfetti();
      alert("✅ Simulated 4500ml intake! 'Camel Mode' unlocked.");
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

  const sendWhatsAppTest = async () => {
      if (!settings.phoneNumber) return alert("Please enter phone number first");
      setSendingMsg(true);
      try {
          await fetch(`https://api.ultramsg.com/${WA_INSTANCE}/messages/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  token: WA_TOKEN, 
                  to: settings.phoneNumber, 
                  body: `🌊 *Jalsa*\n\nHey ${settings.name}!\n💧 Current: ${intake}ml\n🎯 Goal: ${dailyGoal}ml` 
              })
          });
          alert("✅ Sent!");
      } catch (e) { alert("Error sending message"); }
      setSendingMsg(false);
  }

  const percentage = Math.min((intake / dailyGoal) * 100, 100);

  if (!isMounted) return null;

  // --- CHART DATA PREPARATION ---
  const chartData = [...weeklyStats, { date: 'Today', amount: intake }];

  // --- REUSABLE CONTENT BLOCKS ---
  const StatsContent = () => (
    <div className="space-y-6">
       <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-sm text-slate-400 mb-6 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Last 7 Days</h3>
          <div className="h-40 flex items-end justify-between gap-2">
              {chartData.slice(-7).map((stat, i) => {
                  const hPercent = Math.min((stat.amount / dailyGoal) * 100, 100);
                  const label = stat.date === 'Today' ? 'Today' : stat.date.split('/')[0];
                  
                  return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          {/* Tooltip for exact amount */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -mt-8 text-[10px] bg-black/80 px-2 py-1 rounded transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {stat.amount}ml
                          </div>
                          
                          <div className="w-full bg-slate-700/30 rounded-t-lg relative h-full flex items-end overflow-hidden">
                              <motion.div 
                                initial={{ height: 0 }} 
                                animate={{ height: `${hPercent}%` }} 
                                className={`w-full ${hPercent >= 100 ? 'bg-green-400' : 'bg-cyan-500'} opacity-80`} 
                              />
                          </div>
                          <span className={`text-[10px] ${stat.date === 'Today' ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>{label}</span>
                      </div>
                  )
              })}
          </div>
       </div>
       <h3 className="text-sm text-slate-400 flex items-center gap-2"><Trophy className="w-4 h-4"/> Achievements</h3>
       <div className="grid grid-cols-3 gap-3">
           {BADGES.map(badge => (
               <div key={badge.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border ${unlockedBadges.includes(badge.id) ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-500/50' : 'bg-white/5 border-white/5 grayscale opacity-40'}`}>
                   <span className="text-2xl mb-2">{badge.icon}</span>
                   <span className={`text-[10px] font-bold ${unlockedBadges.includes(badge.id) ? 'text-amber-100' : 'text-slate-500'}`}>{badge.name}</span>
               </div>
           ))}
       </div>
    </div>
  );

  const SettingsContent = () => (
    <div className="space-y-6">
       {/* Goal Settings */}
       <div className="bg-white/5 p-5 rounded-3xl space-y-4 border border-white/5">
            <h3 className="font-bold flex items-center gap-2"><Target className="w-4 h-4 text-purple-400"/> Goal Settings</h3>
            <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl">
               <div className="flex flex-col"><span className="text-sm font-medium">Smart Goal</span><span className="text-[10px] text-slate-500">Based on weight</span></div>
               <button onClick={() => setSettings({...settings, useSmartGoal: !settings.useSmartGoal})} className={`w-10 h-5 rounded-full relative transition ${settings.useSmartGoal ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                   <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.useSmartGoal ? 'left-6' : 'left-1'}`} />
               </button>
            </div>
            {!settings.useSmartGoal && <input type="number" value={settings.manualGoal} onChange={(e) => setSettings({...settings, manualGoal: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white" />}
       </div>

       {/* Personal Data */}
       <div className="bg-white/5 p-5 rounded-3xl space-y-4 border border-white/5">
            <h3 className="font-bold flex items-center gap-2"><User className="w-4 h-4 text-blue-400"/> Personal Data</h3>
            <input type="text" placeholder="Name" value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3" />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Weight" value={settings.weight} onChange={(e) => setSettings({...settings, weight: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3" />
                <select value={settings.activityLevel} onChange={(e) => setSettings({...settings, activityLevel: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3"><option>Low</option><option>Moderate</option><option>High</option></select>
            </div>
       </div>

       {/* WhatsApp */}
       <div className="bg-green-900/10 p-5 rounded-3xl space-y-4 border border-green-500/20">
            <h3 className="font-bold text-green-100 flex items-center gap-2"><Smartphone className="w-4 h-4"/> WhatsApp</h3>
            <input type="text" placeholder="919876543210" value={settings.phoneNumber} onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})} className="w-full bg-slate-900 border border-green-500/30 rounded-xl px-4 py-3" />
            <button onClick={sendWhatsAppTest} disabled={sendingMsg} className="w-full py-3 bg-green-600 rounded-xl font-bold flex items-center justify-center gap-2">{sendingMsg ? "Sending..." : "Send Test"}</button>
       </div>

       {/* ⚠️ DEVELOPER / TEST ZONE */}
       <div className="bg-orange-900/10 p-5 rounded-3xl space-y-4 border border-orange-500/20">
            <h3 className="font-bold text-orange-200 flex items-center gap-2"><Wrench className="w-4 h-4"/> Simulation / Test Zone</h3>
            <p className="text-[10px] text-orange-400/70">Tap buttons to force achievements logic.</p>
            <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => simulateStreak(3)} className="p-3 bg-orange-600/20 text-orange-200 text-xs font-bold rounded-xl border border-orange-500/30 hover:bg-orange-600/30 transition">⚡ Force 3-Day</button>
                 <button onClick={() => simulateStreak(7)} className="p-3 bg-red-600/20 text-red-200 text-xs font-bold rounded-xl border border-red-500/30 hover:bg-red-600/30 transition">🔥 Force 7-Day</button>
                 <button onClick={simulateHighVolume} className="col-span-2 p-3 bg-blue-600/20 text-blue-200 text-xs font-bold rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition">🐪 Force Camel Mode (4500ml)</button>
            </div>
       </div>
       
       {/* Reset */}
       <button onClick={() => { if(confirm("Reset?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-400 bg-red-500/10 rounded-2xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4"/> Reset Data</button>
    </div>
  );

  const LogsList = () => (
      <div className="space-y-3">
          {history.length === 0 ? <div className="text-center py-8 text-slate-600 text-sm">No drinks yet.</div> : 
             history.map(log => (
                 <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-800 rounded-full">{DRINK_TYPES.find(d => d.type === log.type)?.icon && React.createElement(DRINK_TYPES.find(d => d.type === log.type)!.icon, { className: "w-4 h-4 text-cyan-400" })}</div>
                         <div><p className="text-sm font-medium text-white">{log.type}</p><p className="text-[10px] text-slate-500">{log.time}</p></div>
                     </div>
                     <div className="text-right"><p className="text-sm font-bold text-cyan-300">+{log.hydratedAmount}ml</p></div>
                 </div>
             ))
          }
      </div>
  );

  // --- MENU COMPONENT (Shared) ---
  const AddMenu = ({ isDesktop }: { isDesktop: boolean }) => (
    <motion.div 
        initial={isDesktop ? { opacity: 0, scale: 0.9 } : { y: "100%" }}
        animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
        exit={isDesktop ? { opacity: 0, scale: 0.9 } : { y: "100%" }}
        className={`absolute z-50 bg-slate-900 border border-white/10 p-8 shadow-2xl
            ${isDesktop 
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] rounded-[32px]' 
                : 'bottom-0 left-0 right-0 rounded-t-[40px] pb-10'
            }`}
    >
        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Add Drink</h3><button onClick={() => setShowAddMenu(false)} className="p-2 bg-white/10 rounded-full"><X className="w-5 h-5"/></button></div>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-6">
            {DRINK_TYPES.map(drink => (
                <button key={drink.type} onClick={() => handleAddDrink(250, drink.type)} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 ${drink.color}`}><drink.icon className="w-6 h-6" /></div>
                    <span className="text-xs text-slate-400">{drink.label}</span>
                </button>
            ))}
        </div>
        <div className="space-y-3">
            <button onClick={() => handleAddDrink(250, 'Water')} className="w-full py-4 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Quick Water (250ml)</button>
            <button onClick={() => handleAddDrink(500, 'Water')} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Bottle (500ml)</button>
        </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full bg-[#0b1121] flex items-center justify-center font-sans text-slate-100 relative selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* =========================================
          VIEW 1: MOBILE (< md) - ORIGINAL LAYOUT
         ========================================= */}
      <div className="md:hidden flex flex-col w-full h-[100dvh] relative z-10 overflow-hidden">
          {/* Mobile Header */}
          <div className="flex justify-between items-center p-6 pb-2">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Hello, {settings.name}</h1>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {streak} Day Streak</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('Stats')} className={`p-3 rounded-full transition ${activeTab === 'Stats' ? 'bg-white/10 text-white' : 'text-slate-400'}`}><BarChart3 className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('Settings')} className={`p-3 rounded-full transition ${activeTab === 'Settings' ? 'bg-white/10 text-white' : 'text-slate-400'}`}><Settings className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Mobile Content Area (Scrollable with Ref) */}
          <div ref={mobileContainerRef} className="flex-1 overflow-y-auto scrollbar-hide pb-32 px-6 pt-4 relative">
              <AnimatePresence mode="wait">
                  {activeTab === 'Home' && (
                      <motion.div key="m-home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                          <div className="mb-8 relative flex justify-center">
                              <WaveProgress percentage={percentage} />
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-white/10 px-4 py-1 rounded-full text-xs text-cyan-300 whitespace-nowrap">Goal: {dailyGoal}ml</div>
                          </div>
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
                          <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold text-slate-300">Today's Logs</h3></div>
                          {LogsList()}
                      </motion.div>
                  )}
                  {activeTab === 'Stats' && (
                      <motion.div key="m-stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h2 className="text-2xl font-bold mb-6">Statistics</h2>
                          {StatsContent()}
                      </motion.div>
                  )}
                  {activeTab === 'Settings' && (
                      <motion.div key="m-settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h2 className="text-2xl font-bold mb-6">Preferences</h2>
                          {SettingsContent()}
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>

          {/* SCROLL TO TOP BUTTON (Mobile Only) */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={scrollToTop}
                className="absolute bottom-28 right-6 p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white shadow-lg z-30"
              >
                <ChevronUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Mobile Bottom Nav */}
          <div className="absolute bottom-6 left-6 right-6 z-40">
             <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-[24px] shadow-2xl flex items-center justify-between pl-6 pr-2 h-[72px]">
                 <button onClick={() => setActiveTab('Home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Home' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}><Droplets className="w-6 h-6 fill-current" /></button>
                 <div className="relative -top-6">
                     <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAddMenu(true)} className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] border-4 border-[#0b1121] text-white"><Plus className="w-8 h-8" strokeWidth={3} /></motion.button>
                 </div>
                 <button onClick={() => setActiveTab('Stats')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Stats' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}><History className="w-6 h-6" /></button>
             </div>
          </div>
      </div>

      {/* =========================================
          VIEW 2: DESKTOP (>= md) - PRO DASHBOARD
         ========================================= */}
      <motion.div layout className="hidden md:grid relative z-10 w-full max-w-7xl h-[90vh] grid-cols-12 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden">
        
        {/* Desktop Sidebar (Col 1-2) */}
        <div className="col-span-2 border-r border-white/5 p-6 flex flex-col justify-between bg-slate-900/50">
           <div>
               <div className="flex items-center gap-3 mb-10 px-2">
                   <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg"><Droplets className="w-5 h-5 text-white fill-white" /></div>
                   <h1 className="text-xl font-bold tracking-tight">Jalsa<span className="text-cyan-400">.</span></h1>
               </div>
               <nav className="space-y-2">
                   {[{id:'Home', icon: LayoutDashboard, label:'Dashboard'}, {id:'Stats', icon: BarChart3, label:'Analytics'}, {id:'Settings', icon: Settings, label:'Settings'}].map((btn) => (
                       <button key={btn.id} onClick={() => setActiveTab(btn.id as any)} className={`relative p-4 rounded-2xl flex items-center gap-3 w-full transition-all duration-300 ${activeTab === btn.id ? 'bg-white/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-500 hover:bg-white/5'}`}>
                           <btn.icon className={`w-5 h-5 ${activeTab === btn.id ? 'scale-110' : ''}`} />
                           <span className="text-sm font-medium">{btn.label}</span>
                           {activeTab === btn.id && <motion.div layoutId="active-pill" className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full" />}
                       </button>
                   ))}
               </nav>
           </div>
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2"><Flame className="w-4 h-4 text-orange-500" /><span className="text-xs font-bold text-orange-200">Streak Fire</span></div>
                <div className="text-2xl font-black text-white">{streak} <span className="text-sm font-normal text-slate-400">Days</span></div>
           </div>
        </div>

        {/* Desktop Hero (Col 3-7) - Always Visible */}
        <div className="col-span-5 relative flex flex-col items-center justify-center p-6 border-r border-white/5">
            <div className="relative mb-12">
                 <WaveProgress percentage={percentage} />
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-sm text-cyan-300 whitespace-nowrap shadow-xl">Goal: {dailyGoal}ml</div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col items-center">
                     <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Intake</span>
                     <span className="text-3xl font-bold text-white">{intake}<span className="text-sm text-slate-500 font-normal ml-1">ml</span></span>
                 </div>
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col items-center">
                     <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Remaining</span>
                     <span className="text-3xl font-bold text-blue-200">{Math.max(0, dailyGoal - intake)}<span className="text-sm text-slate-500 font-normal ml-1">ml</span></span>
                 </div>
            </div>
            <button onClick={() => setShowAddMenu(true)} className="w-full max-w-sm py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add Drink
            </button>
        </div>

        {/* Desktop Context Panel (Col 8-12) */}
        <div className="col-span-5 relative bg-slate-900/30 flex flex-col h-full overflow-hidden">
           <div className="h-full overflow-y-auto scrollbar-hide p-8">
            <AnimatePresence mode="wait">
                {activeTab === 'Home' && (
                    <motion.div key="d-home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex justify-between items-end"><h2 className="text-2xl font-bold">Today's Logs</h2><span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">{history.length} records</span></div>
                        {LogsList()}
                    </motion.div>
                )}
                {activeTab === 'Stats' && (
                    <motion.div key="d-stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-2xl font-bold">Performance</h2>
                        {StatsContent()}
                    </motion.div>
                )}
                {activeTab === 'Settings' && (
                    <motion.div key="d-settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-2xl font-bold">Preferences</h2>
                        {SettingsContent()}
                    </motion.div>
                )}
            </AnimatePresence>
           </div>
        </div>
      </motion.div>

      {/* SHARED MODAL */}
      <AnimatePresence>
          {showAddMenu && (
              <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMenu(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50" />
                  <div className="md:hidden"><AddMenu isDesktop={false} /></div>
                  <div className="hidden md:block"><AddMenu isDesktop={true} /></div>
              </>
          )}
      </AnimatePresence>

    </div>
  );
}"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Droplets, Plus, RotateCcw, Trophy, X, Settings, 
  History, User, Flame, BarChart3, 
  Coffee, Wine, GlassWater, CupSoda, Bell, Send, Smartphone,
  Target, Calculator, LayoutDashboard, Wrench, ChevronUp
} from "lucide-react";

// --- CONFIGURATION (WhatsApp) ---
const WA_INSTANCE = "instance161263"; 
const WA_TOKEN = "llnm6k6wusbr8z5q";

// --- TYPES ---
type DrinkType = 'Water' | 'Coffee' | 'Tea' | 'Soda' | 'Juice';

type LogItem = {
  id: string;
  amount: number; 
  hydratedAmount: number; 
  type: DrinkType;
  time: string;
  timestamp: number;
};

type UserSettings = {
  name: string;
  weight: number; 
  activityLevel: 'Low' | 'Moderate' | 'High';
  manualGoal: number;
  useSmartGoal: boolean;
  phoneNumber: string; 
};

type DayStat = {
  date: string;
  amount: number;
};

// --- CONSTANTS ---
const DRINK_TYPES: { type: DrinkType; label: string; icon: any; hydrationFactor: number; color: string }[] = [
  { type: 'Water', label: 'Water', icon: GlassWater, hydrationFactor: 1.0, color: 'text-cyan-400' },
  { type: 'Coffee', label: 'Coffee', icon: Coffee, hydrationFactor: 0.85, color: 'text-amber-400' }, 
  { type: 'Tea', label: 'Tea', icon: CupSoda, hydrationFactor: 0.9, color: 'text-orange-300' },
  { type: 'Soda', label: 'Soda', icon: Wine, hydrationFactor: 0.6, color: 'text-purple-400' }, 
  { type: 'Juice', label: 'Juice', icon: Droplets, hydrationFactor: 0.95, color: 'text-yellow-400' },
];

const BADGES = [
  { id: 'streak_3', name: '3 Day Streak', icon: '🔥', desc: 'Hit goal 3 days in a row' },
  { id: 'streak_7', name: 'Hydration Hero', icon: '⚡', desc: 'Hit goal 7 days in a row' },
  { id: 'high_vol', name: 'Camel Mode', icon: '🐪', desc: 'Drank over 4000ml in a day' },
];

// --- COMPONENTS ---
const WaveProgress = ({ percentage }: { percentage: number }) => {
  const clampPercent = Math.min(Math.max(percentage, 0), 100);
  const yOffset = 100 - clampPercent;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/10 bg-slate-900/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center">
          <motion.span 
            key={Math.round(percentage)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-white drop-shadow-md"
          >
            {Math.round(percentage)}<span className="text-2xl md:text-3xl text-cyan-400">%</span>
          </motion.span>
        </div>
      </div>
      <motion.div 
        className="absolute bottom-0 left-[-50%] w-[200%] h-[200%] bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-400 opacity-80"
        animate={{ y: `${yOffset - 100}%`, rotate: [0, 360] }}
        transition={{ y: { duration: 1.5, ease: "easeInOut" }, rotate: { duration: 10, repeat: Infinity, ease: "linear" } }}
        style={{ borderRadius: '40%' }}
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-30" />
    </div>
  );
};

// --- MAIN APP ---
export default function JalsaFinal() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Data State
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState<LogItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    name: 'Sanjay',
    weight: 70,
    activityLevel: 'Moderate',
    manualGoal: 3000,
    useSmartGoal: true,
    phoneNumber: ''
  });
  const [streak, setStreak] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<DayStat[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'Home' | 'Stats' | 'Settings'>('Home');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Scroll To Top State (Mobile Only)
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 1. INIT & LOAD
  useEffect(() => {
    setIsMounted(true);
    const today = new Date().toLocaleDateString();
    
    const savedIntake = localStorage.getItem("jalsa_intake");
    const savedDate = localStorage.getItem("jalsa_date");
    
    if (savedDate !== today) {
        if (savedDate) {
            const yesterdayIntake = parseInt(savedIntake || "0");
            const yesterdayGoal = parseInt(localStorage.getItem("jalsa_last_goal") || "3000");
            if (yesterdayIntake >= yesterdayGoal) setStreak(prev => (parseInt(localStorage.getItem("jalsa_streak") || "0")) + 1);
            else setStreak(0);
            
            const savedStats = JSON.parse(localStorage.getItem("jalsa_stats") || "[]");
            const newStat: DayStat = { date: savedDate, amount: yesterdayIntake };
            setWeeklyStats([...savedStats.slice(-6), newStat]);
        }
        setIntake(0);
        setHistory([]);
        localStorage.setItem("jalsa_date", today);
    } else {
        if (savedIntake) setIntake(parseInt(savedIntake));
        if (localStorage.getItem("jalsa_history")) setHistory(JSON.parse(localStorage.getItem("jalsa_history")!));
        if (localStorage.getItem("jalsa_streak")) setStreak(parseInt(localStorage.getItem("jalsa_streak")!));
        if (localStorage.getItem("jalsa_stats")) setWeeklyStats(JSON.parse(localStorage.getItem("jalsa_stats")!));
    }

    if (localStorage.getItem("jalsa_settings")) setSettings(JSON.parse(localStorage.getItem("jalsa_settings")!));
    if (localStorage.getItem("jalsa_badges")) setUnlockedBadges(JSON.parse(localStorage.getItem("jalsa_badges")!));
  }, []);

  // Scroll Listener for Mobile
  useEffect(() => {
    const div = mobileContainerRef.current;
    if (!div) return;

    const handleScroll = () => {
      // Show button if scrolled down more than 300px
      if (div.scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    div.addEventListener('scroll', handleScroll);
    return () => div.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  const scrollToTop = () => {
    if (mobileContainerRef.current) {
      mobileContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 2. CALC GOAL
  const dailyGoal = useMemo(() => {
    if (!settings.useSmartGoal) return settings.manualGoal;
    let base = settings.weight * 35; 
    if (settings.activityLevel === 'Moderate') base += 500;
    if (settings.activityLevel === 'High') base += 1000;
    return Math.round(base / 100) * 100;
  }, [settings]);

  // 3. SAVE
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

  // --- ACTIONS ---
  const handleAddDrink = (amount: number, type: DrinkType) => {
    const drinkData = DRINK_TYPES.find(d => d.type === type);
    const hydrationFactor = drinkData ? drinkData.hydrationFactor : 1;
    const effectiveAmount = Math.round(amount * hydrationFactor);

    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);

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

    if (intake < dailyGoal && newIntake >= dailyGoal) triggerConfetti();
    if (!unlockedBadges.includes('high_vol') && newIntake >= 4000) {
        setUnlockedBadges(prev => [...prev, 'high_vol']);
        alert("🏆 Achievement Unlocked: Camel Mode!");
    }
  };

  // --- TESTING FUNCTIONS ---
  const simulateStreak = (days: number) => {
      setStreak(days);
      const newBadges = [...unlockedBadges];
      if (days >= 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3');
      if (days >= 7 && !newBadges.includes('streak_7')) newBadges.push('streak_7');
      
      setUnlockedBadges(newBadges);
      triggerConfetti();
      alert(`✅ Simulated ${days}-Day Streak! Check Analytics tab.`);
  };

  const simulateHighVolume = () => {
      setIntake(4500);
      if (!unlockedBadges.includes('high_vol')) {
          setUnlockedBadges(prev => [...prev, 'high_vol']);
      }
      triggerConfetti();
      alert("✅ Simulated 4500ml intake! 'Camel Mode' unlocked.");
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

  const sendWhatsAppTest = async () => {
      if (!settings.phoneNumber) return alert("Please enter phone number first");
      setSendingMsg(true);
      try {
          await fetch(`https://api.ultramsg.com/${WA_INSTANCE}/messages/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  token: WA_TOKEN, 
                  to: settings.phoneNumber, 
                  body: `🌊 *Jalsa*\n\nHey ${settings.name}!\n💧 Current: ${intake}ml\n🎯 Goal: ${dailyGoal}ml` 
              })
          });
          alert("✅ Sent!");
      } catch (e) { alert("Error sending message"); }
      setSendingMsg(false);
  }

  const percentage = Math.min((intake / dailyGoal) * 100, 100);

  if (!isMounted) return null;

  // --- CHART DATA PREPARATION ---
  const chartData = [...weeklyStats, { date: 'Today', amount: intake }];

  // --- REUSABLE CONTENT BLOCKS ---
  const StatsContent = () => (
    <div className="space-y-6">
       <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-sm text-slate-400 mb-6 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Last 7 Days</h3>
          <div className="h-40 flex items-end justify-between gap-2">
              {chartData.slice(-7).map((stat, i) => {
                  const hPercent = Math.min((stat.amount / dailyGoal) * 100, 100);
                  const label = stat.date === 'Today' ? 'Today' : stat.date.split('/')[0];
                  
                  return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          {/* Tooltip for exact amount */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -mt-8 text-[10px] bg-black/80 px-2 py-1 rounded transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {stat.amount}ml
                          </div>
                          
                          <div className="w-full bg-slate-700/30 rounded-t-lg relative h-full flex items-end overflow-hidden">
                              <motion.div 
                                initial={{ height: 0 }} 
                                animate={{ height: `${hPercent}%` }} 
                                className={`w-full ${hPercent >= 100 ? 'bg-green-400' : 'bg-cyan-500'} opacity-80`} 
                              />
                          </div>
                          <span className={`text-[10px] ${stat.date === 'Today' ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>{label}</span>
                      </div>
                  )
              })}
          </div>
       </div>
       <h3 className="text-sm text-slate-400 flex items-center gap-2"><Trophy className="w-4 h-4"/> Achievements</h3>
       <div className="grid grid-cols-3 gap-3">
           {BADGES.map(badge => (
               <div key={badge.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border ${unlockedBadges.includes(badge.id) ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-500/50' : 'bg-white/5 border-white/5 grayscale opacity-40'}`}>
                   <span className="text-2xl mb-2">{badge.icon}</span>
                   <span className={`text-[10px] font-bold ${unlockedBadges.includes(badge.id) ? 'text-amber-100' : 'text-slate-500'}`}>{badge.name}</span>
               </div>
           ))}
       </div>
    </div>
  );

  const SettingsContent = () => (
    <div className="space-y-6">
       {/* Goal Settings */}
       <div className="bg-white/5 p-5 rounded-3xl space-y-4 border border-white/5">
            <h3 className="font-bold flex items-center gap-2"><Target className="w-4 h-4 text-purple-400"/> Goal Settings</h3>
            <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl">
               <div className="flex flex-col"><span className="text-sm font-medium">Smart Goal</span><span className="text-[10px] text-slate-500">Based on weight</span></div>
               <button onClick={() => setSettings({...settings, useSmartGoal: !settings.useSmartGoal})} className={`w-10 h-5 rounded-full relative transition ${settings.useSmartGoal ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                   <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.useSmartGoal ? 'left-6' : 'left-1'}`} />
               </button>
            </div>
            {!settings.useSmartGoal && <input type="number" value={settings.manualGoal} onChange={(e) => setSettings({...settings, manualGoal: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white" />}
       </div>

       {/* Personal Data */}
       <div className="bg-white/5 p-5 rounded-3xl space-y-4 border border-white/5">
            <h3 className="font-bold flex items-center gap-2"><User className="w-4 h-4 text-blue-400"/> Personal Data</h3>
            <input type="text" placeholder="Name" value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3" />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Weight" value={settings.weight} onChange={(e) => setSettings({...settings, weight: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3" />
                <select value={settings.activityLevel} onChange={(e) => setSettings({...settings, activityLevel: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3"><option>Low</option><option>Moderate</option><option>High</option></select>
            </div>
       </div>

       {/* WhatsApp */}
       <div className="bg-green-900/10 p-5 rounded-3xl space-y-4 border border-green-500/20">
            <h3 className="font-bold text-green-100 flex items-center gap-2"><Smartphone className="w-4 h-4"/> WhatsApp</h3>
            <input type="text" placeholder="919876543210" value={settings.phoneNumber} onChange={(e) => setSettings({...settings, phoneNumber: e.target.value})} className="w-full bg-slate-900 border border-green-500/30 rounded-xl px-4 py-3" />
            <button onClick={sendWhatsAppTest} disabled={sendingMsg} className="w-full py-3 bg-green-600 rounded-xl font-bold flex items-center justify-center gap-2">{sendingMsg ? "Sending..." : "Send Test"}</button>
       </div>

       {/* ⚠️ DEVELOPER / TEST ZONE */}
       <div className="bg-orange-900/10 p-5 rounded-3xl space-y-4 border border-orange-500/20">
            <h3 className="font-bold text-orange-200 flex items-center gap-2"><Wrench className="w-4 h-4"/> Simulation / Test Zone</h3>
            <p className="text-[10px] text-orange-400/70">Tap buttons to force achievements logic.</p>
            <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => simulateStreak(3)} className="p-3 bg-orange-600/20 text-orange-200 text-xs font-bold rounded-xl border border-orange-500/30 hover:bg-orange-600/30 transition">⚡ Force 3-Day</button>
                 <button onClick={() => simulateStreak(7)} className="p-3 bg-red-600/20 text-red-200 text-xs font-bold rounded-xl border border-red-500/30 hover:bg-red-600/30 transition">🔥 Force 7-Day</button>
                 <button onClick={simulateHighVolume} className="col-span-2 p-3 bg-blue-600/20 text-blue-200 text-xs font-bold rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition">🐪 Force Camel Mode (4500ml)</button>
            </div>
       </div>
       
       {/* Reset */}
       <button onClick={() => { if(confirm("Reset?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-400 bg-red-500/10 rounded-2xl flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4"/> Reset Data</button>
    </div>
  );

  const LogsList = () => (
      <div className="space-y-3">
          {history.length === 0 ? <div className="text-center py-8 text-slate-600 text-sm">No drinks yet.</div> : 
             history.map(log => (
                 <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-800 rounded-full">{DRINK_TYPES.find(d => d.type === log.type)?.icon && React.createElement(DRINK_TYPES.find(d => d.type === log.type)!.icon, { className: "w-4 h-4 text-cyan-400" })}</div>
                         <div><p className="text-sm font-medium text-white">{log.type}</p><p className="text-[10px] text-slate-500">{log.time}</p></div>
                     </div>
                     <div className="text-right"><p className="text-sm font-bold text-cyan-300">+{log.hydratedAmount}ml</p></div>
                 </div>
             ))
          }
      </div>
  );

  // --- MENU COMPONENT (Shared) ---
  const AddMenu = ({ isDesktop }: { isDesktop: boolean }) => (
    <motion.div 
        initial={isDesktop ? { opacity: 0, scale: 0.9 } : { y: "100%" }}
        animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
        exit={isDesktop ? { opacity: 0, scale: 0.9 } : { y: "100%" }}
        className={`absolute z-50 bg-slate-900 border border-white/10 p-8 shadow-2xl
            ${isDesktop 
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] rounded-[32px]' 
                : 'bottom-0 left-0 right-0 rounded-t-[40px] pb-10'
            }`}
    >
        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Add Drink</h3><button onClick={() => setShowAddMenu(false)} className="p-2 bg-white/10 rounded-full"><X className="w-5 h-5"/></button></div>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-4 mb-6">
            {DRINK_TYPES.map(drink => (
                <button key={drink.type} onClick={() => handleAddDrink(250, drink.type)} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 ${drink.color}`}><drink.icon className="w-6 h-6" /></div>
                    <span className="text-xs text-slate-400">{drink.label}</span>
                </button>
            ))}
        </div>
        <div className="space-y-3">
            <button onClick={() => handleAddDrink(250, 'Water')} className="w-full py-4 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Quick Water (250ml)</button>
            <button onClick={() => handleAddDrink(500, 'Water')} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Bottle (500ml)</button>
        </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full bg-[#0b1121] flex items-center justify-center font-sans text-slate-100 relative selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* =========================================
          VIEW 1: MOBILE (< md) - ORIGINAL LAYOUT
         ========================================= */}
      <div className="md:hidden flex flex-col w-full h-[100dvh] relative z-10 overflow-hidden">
          {/* Mobile Header */}
          <div className="flex justify-between items-center p-6 pb-2">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Hello, {settings.name}</h1>
                <p className="text-xs text-slate-400 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {streak} Day Streak</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('Stats')} className={`p-3 rounded-full transition ${activeTab === 'Stats' ? 'bg-white/10 text-white' : 'text-slate-400'}`}><BarChart3 className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('Settings')} className={`p-3 rounded-full transition ${activeTab === 'Settings' ? 'bg-white/10 text-white' : 'text-slate-400'}`}><Settings className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Mobile Content Area (Scrollable with Ref) */}
          <div ref={mobileContainerRef} className="flex-1 overflow-y-auto scrollbar-hide pb-32 px-6 pt-4 relative">
              <AnimatePresence mode="wait">
                  {activeTab === 'Home' && (
                      <motion.div key="m-home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                          <div className="mb-8 relative flex justify-center">
                              <WaveProgress percentage={percentage} />
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-white/10 px-4 py-1 rounded-full text-xs text-cyan-300 whitespace-nowrap">Goal: {dailyGoal}ml</div>
                          </div>
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
                          <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold text-slate-300">Today's Logs</h3></div>
                          {LogsList()}
                      </motion.div>
                  )}
                  {activeTab === 'Stats' && (
                      <motion.div key="m-stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h2 className="text-2xl font-bold mb-6">Statistics</h2>
                          {StatsContent()}
                      </motion.div>
                  )}
                  {activeTab === 'Settings' && (
                      <motion.div key="m-settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h2 className="text-2xl font-bold mb-6">Preferences</h2>
                          {SettingsContent()}
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>

          {/* SCROLL TO TOP BUTTON (Mobile Only) */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={scrollToTop}
                className="absolute bottom-28 right-6 p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white shadow-lg z-30"
              >
                <ChevronUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Mobile Bottom Nav */}
          <div className="absolute bottom-6 left-6 right-6 z-40">
             <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-[24px] shadow-2xl flex items-center justify-between pl-6 pr-2 h-[72px]">
                 <button onClick={() => setActiveTab('Home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Home' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}><Droplets className="w-6 h-6 fill-current" /></button>
                 <div className="relative -top-6">
                     <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAddMenu(true)} className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] border-4 border-[#0b1121] text-white"><Plus className="w-8 h-8" strokeWidth={3} /></motion.button>
                 </div>
                 <button onClick={() => setActiveTab('Stats')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Stats' ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}><History className="w-6 h-6" /></button>
             </div>
          </div>
      </div>

      {/* =========================================
          VIEW 2: DESKTOP (>= md) - PRO DASHBOARD
         ========================================= */}
      <motion.div layout className="hidden md:grid relative z-10 w-full max-w-7xl h-[90vh] grid-cols-12 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden">
        
        {/* Desktop Sidebar (Col 1-2) */}
        <div className="col-span-2 border-r border-white/5 p-6 flex flex-col justify-between bg-slate-900/50">
           <div>
               <div className="flex items-center gap-3 mb-10 px-2">
                   <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg"><Droplets className="w-5 h-5 text-white fill-white" /></div>
                   <h1 className="text-xl font-bold tracking-tight">Jalsa<span className="text-cyan-400">.</span></h1>
               </div>
               <nav className="space-y-2">
                   {[{id:'Home', icon: LayoutDashboard, label:'Dashboard'}, {id:'Stats', icon: BarChart3, label:'Analytics'}, {id:'Settings', icon: Settings, label:'Settings'}].map((btn) => (
                       <button key={btn.id} onClick={() => setActiveTab(btn.id as any)} className={`relative p-4 rounded-2xl flex items-center gap-3 w-full transition-all duration-300 ${activeTab === btn.id ? 'bg-white/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-500 hover:bg-white/5'}`}>
                           <btn.icon className={`w-5 h-5 ${activeTab === btn.id ? 'scale-110' : ''}`} />
                           <span className="text-sm font-medium">{btn.label}</span>
                           {activeTab === btn.id && <motion.div layoutId="active-pill" className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full" />}
                       </button>
                   ))}
               </nav>
           </div>
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2"><Flame className="w-4 h-4 text-orange-500" /><span className="text-xs font-bold text-orange-200">Streak Fire</span></div>
                <div className="text-2xl font-black text-white">{streak} <span className="text-sm font-normal text-slate-400">Days</span></div>
           </div>
        </div>

        {/* Desktop Hero (Col 3-7) - Always Visible */}
        <div className="col-span-5 relative flex flex-col items-center justify-center p-6 border-r border-white/5">
            <div className="relative mb-12">
                 <WaveProgress percentage={percentage} />
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-sm text-cyan-300 whitespace-nowrap shadow-xl">Goal: {dailyGoal}ml</div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col items-center">
                     <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Intake</span>
                     <span className="text-3xl font-bold text-white">{intake}<span className="text-sm text-slate-500 font-normal ml-1">ml</span></span>
                 </div>
                 <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col items-center">
                     <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Remaining</span>
                     <span className="text-3xl font-bold text-blue-200">{Math.max(0, dailyGoal - intake)}<span className="text-sm text-slate-500 font-normal ml-1">ml</span></span>
                 </div>
            </div>
            <button onClick={() => setShowAddMenu(true)} className="w-full max-w-sm py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add Drink
            </button>
        </div>

        {/* Desktop Context Panel (Col 8-12) */}
        <div className="col-span-5 relative bg-slate-900/30 flex flex-col h-full overflow-hidden">
           <div className="h-full overflow-y-auto scrollbar-hide p-8">
            <AnimatePresence mode="wait">
                {activeTab === 'Home' && (
                    <motion.div key="d-home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex justify-between items-end"><h2 className="text-2xl font-bold">Today's Logs</h2><span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">{history.length} records</span></div>
                        {LogsList()}
                    </motion.div>
                )}
                {activeTab === 'Stats' && (
                    <motion.div key="d-stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-2xl font-bold">Performance</h2>
                        {StatsContent()}
                    </motion.div>
                )}
                {activeTab === 'Settings' && (
                    <motion.div key="d-settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-2xl font-bold">Preferences</h2>
                        {SettingsContent()}
                    </motion.div>
                )}
            </AnimatePresence>
           </div>
        </div>
      </motion.div>

      {/* SHARED MODAL */}
      <AnimatePresence>
          {showAddMenu && (
              <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMenu(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50" />
                  <div className="md:hidden"><AddMenu isDesktop={false} /></div>
                  <div className="hidden md:block"><AddMenu isDesktop={true} /></div>
              </>
          )}
      </AnimatePresence>

    </div>
  );
}