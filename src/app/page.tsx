"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Droplets, Plus, RotateCcw, Trophy, Info, X, Settings, History, ChevronRight, Edit2 } from "lucide-react";

// Types for History Log
type LogItem = {
  id: string;
  amount: number;
  type: 'Glass' | 'Bottle' | 'Custom';
  time: string;
};

export default function Home() {
  // State Management
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState(3000);
  const [intake, setIntake] = useState(0);
  const [history, setHistory] = useState<LogItem[]>([]);
  
  // UI States
  const [showModal, setShowModal] = useState(false); // How to Use
  const [showHistory, setShowHistory] = useState(false); // History Panel
  const [showSettings, setShowSettings] = useState(false); // Goal Setting
  const [isMounted, setIsMounted] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState("3000");

  // Load Data on Start
  useEffect(() => {
    setIsMounted(true);
    const savedIntake = localStorage.getItem("jalsaIntake");
    const savedGoal = localStorage.getItem("jalsaGoal");
    const savedHistory = localStorage.getItem("jalsaHistory");
    const lastDate = localStorage.getItem("jalsaDate");
    const today = new Date().toLocaleDateString();

    // Reset if new day
    if (lastDate !== today) {
      setIntake(0);
      setHistory([]);
      setHydrated(false);
      localStorage.setItem("jalsaDate", today);
    } else {
      if (savedIntake) setIntake(parseInt(savedIntake));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }

    if (savedGoal) {
        setGoal(parseInt(savedGoal));
        setCustomGoalInput(savedGoal);
    }
  }, []);

  // Save Data on Change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("jalsaIntake", intake.toString());
      localStorage.setItem("jalsaGoal", goal.toString());
      localStorage.setItem("jalsaHistory", JSON.stringify(history));
      
      // Goal Achievement Check
      if (intake >= goal && !hydrated && goal > 0) {
        setHydrated(true);
        triggerConfetti();
      } else if (intake < goal) {
        setHydrated(false);
      }
    }
  }, [intake, goal, history, hydrated, isMounted]);

  // Add Water Function
  const addWater = (amount: number, type: 'Glass' | 'Bottle' | 'Custom') => {
    const newIntake = intake + amount;
    setIntake(newIntake);
    
    const newLog: LogItem = {
        id: Date.now().toString(),
        amount: amount,
        type: type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setHistory(prev => [newLog, ...prev]); // Add new log to top
  };

  // Reset Function
  const resetIntake = () => {
    if (confirm("Are you sure you want to reset today's data?")) {
      setIntake(0);
      setHistory([]);
      setHydrated(false);
    }
  };

  // Update Goal
  const handleGoalUpdate = () => {
      const newGoal = parseInt(customGoalInput);
      if (newGoal > 0) {
          setGoal(newGoal);
          setShowSettings(false);
      }
  };

  // Confetti Animation
  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#3b82f6", "#22d3ee", "#ffffff"] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#3b82f6", "#22d3ee", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  // Calculations
  const percentage = Math.min((intake / goal) * 100, 100);
  const extraIntake = Math.max(0, intake - goal);
  const isOverHydrated = intake > goal;

  if (!isMounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900 z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      {/* Main Container */}
      <AnimatePresence mode="wait">
        {!showSettings && !showHistory ? (
            <motion.div 
                key="main"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
                {/* Top Bar */}
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <button onClick={() => setShowSettings(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
                        <Settings className="w-5 h-5 text-blue-200" />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Jalsa Hydration</span>
                        <span className="text-[10px] text-blue-300/50">{new Date().toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => setShowModal(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
                        <Info className="w-5 h-5 text-blue-200" />
                    </button>
                </div>

                {/* Main Progress Area */}
                <div className="flex flex-col items-center justify-center py-8 relative">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        {/* SVG Progress */}
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Track */}
                            <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-blue-950/50" />
                            {/* Indicator */}
                            <circle 
                                cx="128" cy="128" r="110" 
                                stroke="currentColor" strokeWidth="20" fill="transparent"
                                strokeDasharray={2 * Math.PI * 110}
                                strokeDashoffset={2 * Math.PI * 110 - (percentage / 100) * 2 * Math.PI * 110}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ease-out ${isOverHydrated ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]'}`}
                            />
                        </svg>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-bold text-white">{Math.round(percentage)}%</span>
                            <div className="flex flex-col items-center mt-2">
                                <span className="text-sm text-blue-200">{intake} / {goal} ml</span>
                                {isOverHydrated && (
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full mt-1">
                                        +{extraIntake}ml Extra
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="px-6 pb-8 space-y-4">
                    {/* Add Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addWater(250, 'Glass')}
                            className="group relative overflow-hidden bg-gradient-to-b from-blue-500/20 to-blue-600/10 border border-blue-400/20 hover:border-blue-400/50 p-4 rounded-2xl flex flex-col items-center justify-center transition-all"
                        >
                            <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Plus className="w-6 h-6 text-cyan-300 mb-1" />
                            <span className="text-sm font-semibold text-blue-100">Glass (250ml)</span>
                        </motion.button>

                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addWater(500, 'Bottle')}
                            className="group relative overflow-hidden bg-gradient-to-b from-blue-500/20 to-blue-600/10 border border-blue-400/20 hover:border-blue-400/50 p-4 rounded-2xl flex flex-col items-center justify-center transition-all"
                        >
                             <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Trophy className="w-6 h-6 text-yellow-300 mb-1" />
                            <span className="text-sm font-semibold text-blue-100">Bottle (500ml)</span>
                        </motion.button>
                    </div>

                    {/* View History Button */}
                    <button 
                        onClick={() => setShowHistory(true)}
                        className="w-full py-3 flex items-center justify-between px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-blue-200 transition group"
                    >
                        <span className="flex items-center gap-2"><History className="w-4 h-4" /> Today's Log</span>
                        <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </motion.div>
        ) : showSettings ? (
            // Settings Panel
            <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl p-6"
            >
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <button onClick={() => setShowSettings(false)} className="p-2 bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-blue-300 mb-2">Daily Goal (ml)</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={customGoalInput}
                                onChange={(e) => setCustomGoalInput(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-cyan-500"
                            />
                            <button onClick={handleGoalUpdate} className="bg-cyan-500 text-black font-bold px-6 rounded-xl hover:bg-cyan-400 transition">Save</button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Recommended: 3000ml for active adults.</p>
                    </div>

                    <hr className="border-white/5" />

                    <button onClick={resetIntake} className="w-full py-4 flex items-center justify-center gap-2 text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition">
                        <RotateCcw className="w-4 h-4" /> Reset Today's Data
                    </button>
                </div>
            </motion.div>
        ) : (
             // History Panel
             <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl p-6 h-[600px] flex flex-col"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-cyan-400"/> History</h2>
                    <button onClick={() => setShowHistory(false)} className="p-2 bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <Droplets className="w-12 h-12 mb-2 opacity-20" />
                            <p>No records yet today.</p>
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${item.type === 'Bottle' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                        {item.type === 'Bottle' ? <Trophy className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{item.type}</p>
                                        <p className="text-xs text-slate-400">{item.time}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-cyan-400">+{item.amount}ml</span>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="absolute bottom-4 text-center w-full z-0">
         <p className="text-blue-100/20 text-[10px] uppercase tracking-[0.3em]">Powered by Jalsa</p>
      </div>

      {/* How to Use Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-white/10 text-white rounded-3xl p-6 max-w-xs w-full shadow-2xl relative"
            >
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-400">
                    <Info className="w-5 h-5" /> Quick Guide
                </h2>
                
                <div className="space-y-6 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 to-transparent opacity-30"></div>

                    <div className="flex gap-4 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 border-4 border-slate-900 text-[10px] font-bold">1</div>
                        <div>
                            <h3 className="font-bold text-sm">Set Your Goal</h3>
                            <p className="text-xs text-slate-400 mt-1">Tap the Settings (⚙️) icon to customize your daily target.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shrink-0 border-4 border-slate-900 text-[10px] font-bold">2</div>
                        <div>
                            <h3 className="font-bold text-sm">Log Intake</h3>
                            <p className="text-xs text-slate-400 mt-1">Tap 'Glass' or 'Bottle' to add water. Check 'History' to see logs.</p>
                        </div>
                    </div>
                     <div className="flex gap-4 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 border-4 border-slate-900 text-[10px] font-bold">3</div>
                        <div>
                            <h3 className="font-bold text-sm">Track & Win</h3>
                            <p className="text-xs text-slate-400 mt-1">Fill the circle to 100%. Don't worry if you go over!</p>
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowModal(false)} className="w-full mt-8 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition">
                    Let's Start!
                </button>
            </motion.div>
        </div>
      )}
    </div>
  );
}