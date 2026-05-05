import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgrammeType, Food, FoodLogEntry } from '@/types/nutrition';
import { getInitialProgramme } from '@/lib/nutrition-store';
import { AuthScreen } from '@/components/AuthScreen';
import { ProgrammeSelect } from '@/components/ProgrammeSelect';
import { Dashboard } from '@/components/Dashboard';
import { FoodSearch } from '@/components/FoodSearch';
import { ProfileView } from '@/components/ProfileView';
import { BottomNav } from '@/components/BottomNav';
import { useAuthStore } from "@/lib/auth-store";
import { fetchFoodLog, addFoodLog, deleteFoodLog } from '@/api/food-log';

const toDateString = (d: Date) => d.toISOString().split("T")[0];

const Index = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const init = useAuthStore((s) => s.init);

  console.log("Index rendered, user =", user);

  const [programme, setProgramme] = useState<ProgrammeType | null>(
    () => (user?.programme as ProgrammeType) ?? getInitialProgramme()
  );
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [logDate, setLogDate] = useState<Date>(new Date());

  // Rulează init O SINGURĂ DATĂ la pornire
  useEffect(() => {
    console.log("CALLING INIT");
    init();
  }, []);

  // ── Sincronizează programme din user ─────────────────────────────────────
  useEffect(() => {
    if (user?.programme) {
      setProgramme(user.programme as ProgrammeType);
    } else if (user && !user.programme) {
      setProgramme(null);
    }
  }, [user?.programme, user]);

  // ── Încarcă jurnalul din backend ──────────────────────────────────────────
  const loadLog = useCallback(async (date: Date) => {
    if (!token) return;
    try {
      const data = await fetchFoodLog(token, toDateString(date));
      const entries: FoodLogEntry[] = data.map((e: any) => ({
        id: String(e.id),
        food: e.food,
        quantity: e.quantity,
        mealType: e.meal_type,
        timestamp: new Date(e.date),
      }));
      setFoodLog(entries);
    } catch {
      setFoodLog([]);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      loadLog(logDate);
    }
  }, [user, token, logDate]);

  // ── Adaugă o masă ─────────────────────────────────────────────────────────
  const handleAddFood = useCallback(async (food: Food, mealType: FoodLogEntry['mealType']) => {
    if (!token) return;
    try {
      const newEntry = await addFoodLog(token, {
        food_id: food.id,
        quantity: 1,
        meal_type: mealType,
        date: toDateString(logDate),
      });
      setFoodLog(prev => [...prev, {
        id: String(newEntry.id),
        food: newEntry.food,
        quantity: newEntry.quantity,
        mealType: newEntry.meal_type,
        timestamp: new Date(newEntry.date),
      }]);
    } catch {
      console.error("Could not add food.");
    }
    setShowSearch(false);
    setActiveTab('dashboard');
  }, [token, logDate]);

  // ── Șterge o masă ─────────────────────────────────────────────────────────
  const handleRemoveEntry = useCallback(async (id: string) => {
    if (!token) return;
    try {
      await deleteFoodLog(token, Number(id));
      setFoodLog(prev => prev.filter(e => e.id !== id));
    } catch {
      console.error("Could not delete entry.");
    }
  }, [token]);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'add') {
      setShowSearch(true);
    } else {
      setActiveTab(tab);
    }
  }, []);

  // 🔥 Noua logică de autentificare
  if (!user) {
    return <AuthScreen />;
  }

  // Onboarding: programme selection
  if (programme === null) {
  return <ProgrammeSelect current={null} />;
}

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {activeTab === 'dashboard' && programme && (
        <Dashboard
          programme={programme}
          foodLog={foodLog}
          onRemoveEntry={handleRemoveEntry}
          onChangeProgramme={() => setProgramme(null)}
          selectedDate={logDate}
          onDateChange={setLogDate}
        />
      )}

      {activeTab === 'search' && (
        <FoodSearch onAdd={handleAddFood} onClose={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'profile' && (
        <ProfileView />
      )}

      <AnimatePresence>
        {showSearch && (
          <FoodSearch onAdd={handleAddFood} onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
