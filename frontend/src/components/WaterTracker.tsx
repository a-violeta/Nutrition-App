import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Funcția pentru calculul apei bazat pe greutate
function getDailyWaterGoal(weightKg?: number): number {
  if (!weightKg || weightKg <= 0) return 2000;
  return Math.round(weightKg * 33);
}

type TodayResponse = {
  total_ml: number;
};

interface WaterTrackerProps {
  token: string | null;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({ token }) => {
  // Aducem datele userului pentru a-i afla greutatea
  const user = useAuthStore((s: any) => s.user);
  const dailyGoal = getDailyWaterGoal(user?.weight);

  const [totalMl, setTotalMl] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [posting, setPosting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

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
      await fetchTotal();
    } catch (err: any) {
      setError(err?.message || 'Failed to add water');
    } finally {
      setPosting(false);
    }
  };

  const handleUndo = async () => {
    if (!token) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/water/undo`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(JSON.parse(text).detail || 'Failed to undo');
      }
      await fetchTotal();
    } catch (err: any) {
      setError(err?.message || 'Nimic de anulat azi!');
      setTimeout(() => setError(null), 3000);
    } finally {
      setPosting(false);
    }
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount);
      setCustomAmount('');
    }
  };

  // Calculăm procentul de umplere bazat pe noul TARGET DINAMIC
  const progress = Math.min(100, Math.round((totalMl / dailyGoal) * 100));

  return (
    <div className="relative w-full h-full min-h-[60vh] flex flex-col justify-between overflow-hidden rounded-t-[2rem] rounded-b-none">
      
      {/* ================= RECIPIENTUL DE APĂ ================= */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-0 flex flex-col justify-end"
        initial={{ height: '0%' }}
        animate={{ height: `${progress}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="absolute bottom-full left-0 right-0 h-[45px] translate-y-[1px]">
          <motion.div 
            className="absolute bottom-0 left-0 w-[200%] flex text-blue-500"
            animate={{ x: ["-50%", "0%"] }} 
            transition={{ repeat: Infinity, ease: "linear", duration: 7 }}
          >
            <svg className="w-1/2 flex-shrink-0" viewBox="0 0 1440 320" preserveAspectRatio="none" fill="currentColor" style={{ height: '45px' }}>
              <path d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,144C672,149,768,203,864,202.7C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg className="w-1/2 flex-shrink-0 -ml-[1px]" viewBox="0 0 1440 320" preserveAspectRatio="none" fill="currentColor" style={{ height: '45px' }}>
              <path d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,144C672,149,768,203,864,202.7C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </motion.div>
        </div>
        <div className="w-full h-full bg-blue-500" />
      </motion.div>

      {/* TEXTUL DE DEASUPRA APEI */}
      <div className="relative z-10 p-4 md:p-8 flex flex-col items-center justify-center flex-1 pointer-events-none mt-8">
        <p className="text-sm md:text-base font-bold text-white/90 mb-2 uppercase tracking-widest drop-shadow-md">
          Today's Hydration
        </p>
        
        <div className="flex items-baseline justify-center gap-2">
          <h2 className="text-7xl md:text-[8rem] font-extrabold text-white tracking-tighter leading-none drop-shadow-xl">
            {loading ? '...' : totalMl}
          </h2>
          <span className="text-xl md:text-3xl text-white font-bold mb-4 drop-shadow-lg">ml</span>
        </div>
        
        <p className="text-base md:text-lg font-medium text-white/90 mt-2 drop-shadow-md">
          {progress >= 100 ? 'Goal Reached! 🎉' : `${Math.max(0, dailyGoal - totalMl)} ml to go`}
        </p>

        {error && <div className="mt-4 text-sm text-red-100 bg-red-900/80 p-3 rounded-xl text-center backdrop-blur-md">{error}</div>}
      </div>

      {/* BUTOANELE */}
      <div className="relative z-10 p-4 md:p-8 flex flex-col gap-4 mt-auto w-full max-w-xl mx-auto">
        <div className="flex gap-3 md:gap-4">
          <button onClick={() => addWater(250)} disabled={posting} className="flex-1 py-3 md:py-4 px-4 md:px-6 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md text-white text-base md:text-lg font-bold rounded-2xl md:rounded-3xl shadow-sm border border-white/20 transition-all disabled:opacity-50 active:scale-95">
            💧 + 250ml
          </button>
          <button onClick={() => addWater(500)} disabled={posting} className="flex-1 py-3 md:py-4 px-4 md:px-6 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md text-white text-base md:text-lg font-bold rounded-2xl md:rounded-3xl shadow-sm border border-white/20 transition-all disabled:opacity-50 active:scale-95">
            🌊 + 500ml
          </button>
        </div>

        <div className="flex gap-3 md:gap-4 items-center">
          <div className="flex flex-1 bg-slate-900/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-1 border border-white/20 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-400/50">
            <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Custom ml..." disabled={posting} className="w-full bg-transparent border-none outline-none px-4 text-white placeholder:text-white/50 text-base md:text-lg font-medium" />
            <button onClick={handleCustomAdd} disabled={posting || !customAmount} className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl md:rounded-[1.25rem] transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100">
              Add
            </button>
          </div>
          <button onClick={handleUndo} disabled={posting || totalMl === 0} className="px-4 md:px-6 py-3 md:py-4 bg-red-500/20 hover:bg-red-500/40 text-red-200 font-bold rounded-2xl md:rounded-3xl shadow-sm border border-red-400/30 backdrop-blur-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2" title="Undo last water entry">
            <span className="text-lg md:text-xl leading-none">↺</span> <span className="hidden sm:inline">Undo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;