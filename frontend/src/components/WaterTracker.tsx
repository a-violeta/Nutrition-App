import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API =
  window.location.port === "8080"
    ? "http://localhost:8000"
    : "";

const DAILY_GOAL = 2000;

type TodayResponse = {
  total_ml: number;
};

interface WaterTrackerProps {
  token: string | null;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ token }) => {
  const [totalMl, setTotalMl] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTotal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/water/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: TodayResponse = await res.json();
      setTotalMl(data.total_ml ?? 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load total');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTotal();
  }, [token]);

  const addWater = async (amountMl: number) => {
    // 1. PLASA DE SIGURANȚĂ: Verificăm dacă token-ul există efectiv
    if (!token) {
      setError("Autentificare pierdută! Te rog să dai un refresh și să te reloghezi.");
      return;
    }

    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/water/?amount_ml=${amountMl}`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server responded ${res.status}`);
      }
      // Reîncărcăm totalul după ce am adăugat cu succes
      await fetchTotal();
    } catch (err: any) {
      setError(err?.message || 'Failed to add water');
    } finally {
      setPosting(false);
    }
  };

  // Calculate percentage (capped at 100%)
  const progress = Math.min(100, Math.round((totalMl / DAILY_GOAL) * 100));

  return (
    /* 1. GIANT CONTAINER: max-w-4xl for width, h-[65vh] for massive height */
    <div className="relative max-w-4xl w-full mx-auto bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[65vh] min-h-[500px] flex flex-col justify-between">
      
      {/* 2. THE ANIMATED WATER LAYER */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-blue-300 dark:bg-blue-600/40 z-0 flex flex-col justify-start"
        initial={{ height: '0%' }}
        animate={{ height: `${progress}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        {/* SVG Wave */}
        <svg 
          className="w-full absolute top-0 -translate-y-[99%] text-blue-300 dark:text-blue-600/40" 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none" 
          fill="currentColor"
          style={{ height: '60px' }} /* Made the wave a bit taller to match the big screen */
        >
          <path d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,144C672,149,768,203,864,202.7C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </motion.div>

      {/* 3. THE FOREGROUND CONTENT (Centered and HUGE) */}
      <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full pointer-events-none mt-8">
        <p className="text-base md:text-lg font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">
          Today's Hydration
        </p>
        
        <div className="flex items-baseline justify-center gap-2">
          {/* HUGE Numbers */}
          <h2 className="text-8xl md:text-[9rem] font-extrabold text-slate-800 dark:text-slate-100 tracking-tighter leading-none">
            {loading ? '...' : totalMl}
          </h2>
          <span className="text-2xl md:text-4xl text-slate-500 font-bold mb-4">ml</span>
        </div>
        
        <p className="text-lg md:text-xl font-medium text-slate-500 mt-4">
          {progress >= 100 ? 'Goal Reached! 🎉' : `${DAILY_GOAL - totalMl} ml to go`}
        </p>

        {error && <div className="mt-6 text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">{error}</div>}
      </div>

      {/* 4. CHUNKY BUTTONS */}
      <div className="relative z-10 p-6 md:p-8 flex gap-4 mt-auto w-full max-w-2xl mx-auto">
        <button
          onClick={() => addWater(250)}
          disabled={posting}
          className="flex-1 py-5 px-6 bg-white/60 hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-white text-lg md:text-xl font-bold rounded-3xl shadow-sm border border-white/30 transition-all disabled:opacity-50 active:scale-95"
        >
          💧 + 250ml
        </button>

        <button
          onClick={() => addWater(500)}
          disabled={posting}
          className="flex-1 py-5 px-6 bg-white/60 hover:bg-white/90 dark:bg-slate-800/60 dark:hover:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-white text-lg md:text-xl font-bold rounded-3xl shadow-sm border border-white/30 transition-all disabled:opacity-50 active:scale-95"
        >
          🌊 + 500ml
        </button>
      </div>
    </div>
  );
};

export default WaterTracker;