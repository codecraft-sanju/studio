"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Droplets, Plus, RotateCcw, Trophy, Info, X } from "lucide-react";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [goal, setGoal] = useState(3000);
  const [intake, setIntake] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedIntake = localStorage.getItem("jalsaIntake");
    if (savedIntake) setIntake(parseInt(savedIntake));
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("jalsaIntake", intake.toString());
      if (intake >= goal && !hydrated) {
        setHydrated(true);
        triggerConfetti();
      } else if (intake < goal) {
        setHydrated(false);
      }
    }
  }, [intake, goal, hydrated, isMounted]);

  const addWater = (amount: number) => {
    setIntake((prev) => Math.min(prev + amount, 5000));
  };

  const resetIntake = () => {
    if (confirm("Reset today's tracking?")) {
      setIntake(0);
      setHydrated(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#3b82f6", "#06b6d4", "#ffffff"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#3b82f6", "#06b6d4", "#ffffff"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const percentage = Math.min((intake / goal) * 100, 100);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-600 to-cyan-400 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse delay-75"></div>

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-white/10">
                    <Droplets className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">Jalsa Hydration</h1>
                    <p className="text-xs text-blue-200 font-medium tracking-wide">DAILY TRACKER</p>
                </div>
            </div>
            <button onClick={() => setShowModal(true)} className="p-2 hover:bg-white/10 rounded-full transition border border-transparent hover:border-white/10">
                <Info className="w-5 h-5 text-blue-200" />
            </button>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center mb-8 relative py-4">
          <svg className="w-56 h-56 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="112" cy="112" r="90"
              stroke="currentColor" strokeWidth="16" fill="transparent"
              className="text-blue-900/40"
            />
            {/* Progress Circle */}
            <circle
              cx="112" cy="112" r="90"
              stroke="currentColor" strokeWidth="16" fill="transparent"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 - (percentage / 100) * 2 * Math.PI * 90}
              className={`text-cyan-400 transition-all duration-1000 ease-out ${hydrated ? 'drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]' : ''}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-5xl font-bold block mb-1">{Math.round(percentage)}%</span>
            <p className="text-sm text-cyan-100/80 font-medium">{intake} / {goal} ml</p>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => addWater(250)}
                className="group flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 hover:border-cyan-400/30 rounded-2xl transition-all shadow-lg"
            >
                <Plus className="w-6 h-6 mb-2 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-sm">Glass (250ml)</span>
            </motion.button>

            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => addWater(500)}
                className="group flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 hover:border-cyan-400/30 rounded-2xl transition-all shadow-lg"
            >
                <Trophy className="w-6 h-6 mb-2 text-yellow-300 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-sm">Bottle (500ml)</span>
            </motion.button>
        </div>

        {/* Reset */}
        <button 
            onClick={resetIntake}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-blue-200/70 hover:text-white hover:bg-white/5 rounded-xl transition border border-transparent hover:border-white/5"
        >
            <RotateCcw className="w-4 h-4" />
            Reset for Today
        </button>
      </motion.div>

        {/* Footer */}
        <div className="absolute bottom-4 text-center w-full">
            <p className="text-blue-100/40 text-[10px] uppercase tracking-widest">Powered by Jalsa Water Supply</p>
        </div>

        {/* Instructions Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white text-slate-800 rounded-3xl p-6 max-w-xs w-full shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <Info className="w-5 h-5 text-blue-500" /> How to Use
                    </h2>
                    <ul className="space-y-4 text-sm text-slate-600">
                        <li className="flex items-start gap-3">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">1</span>
                            <span><strong>Goal:</strong> Your target is 3000ml (Daily Recommended).</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-cyan-100 text-cyan-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">2</span>
                            <span><strong>Track:</strong> Tap buttons to add water.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-yellow-100 text-yellow-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">3</span>
                            <span><strong>Win:</strong> Fill the circle for a surprise! 🎉</span>
                        </li>
                    </ul>
                    <button 
                        onClick={() => setShowModal(false)}
                        className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                    >
                        Start Hydrating
                    </button>
                </motion.div>
            </div>
        )}
    </div>
  );
}