import { useState, useCallback, useEffect } from 'react';
import { ProgrammeType, Food, FoodLogEntry } from '@/types/nutrition';
import { getInitialProgramme } from '@/lib/nutrition-store';
import { AuthScreen } from '@/components/AuthScreen';
import { ProgrammeSelect } from '@/components/ProgrammeSelect';
import { OnboardingForm } from '@/components/OnboardingForm';
import { Dashboard } from '@/components/Dashboard';
import { FoodSearch } from '@/components/FoodSearch';
import { ProfileView } from '@/components/ProfileView';
import { BottomNav } from '@/components/BottomNav';
import WeeklyProgress from '@/components/WeeklyProgress';
import { useAuthStore } from "@/lib/auth-store";
import { fetchFoodLog, addFoodLog, deleteFoodLog } from '@/api/food-log';
import { AnimatePresence, motion } from 'framer-motion';

const toDateString = (d: Date) => d.toISOString().split("T")[0];

const Index = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const init = useAuthStore((s) => s.init);

  const [programme, setProgramme] = useState<ProgrammeType | null>(
    () => (user?.programme as ProgrammeType) ?? getInitialProgramme()
  );

  // showOnboarding = true dacă userul nu are date fizice completate
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  useEffect(() => {
    if (!user) {
      setOnboardingDone(false);
      setShowOnboarding(false);
    }
}, [user]);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") ?? "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [logDate, setLogDate] = useState<Date>(new Date());
  
  // ── STATE NOU PENTRU REFRESH LA APĂ ───────────────────────────────────────
  const [waterTrigger, setWaterTrigger] = useState(0);

  useEffect(() => {
    init();
  }, []);

  // ── Sincronizează programme din user ─────────────────────────────────────
  useEffect(() => {
  if (user?.programme) {
    setProgramme(user.programme as ProgrammeType);
    if (!user.weight && !user.height && !user.age && !user.sex) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  } else if (user && !user.programme) {
    setProgramme(null);
    setShowOnboarding(false);
  }
}, [user?.programme]);

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
      setActiveTab('search');
    } else {
      setActiveTab(tab);
    }
  }, []);

  if (!user) return <AuthScreen />;
  if (programme === null) return <ProgrammeSelect current={null} />;
  if (showOnboarding && !onboardingDone) return (
  <OnboardingForm onComplete={() => {
    setOnboardingDone(true);
    setShowOnboarding(false);
  }} />
);

return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative pb-20">
      {activeTab === 'dashboard' && programme && (
        <Dashboard
          programme={programme}
          foodLog={foodLog}
          onRemoveEntry={handleRemoveEntry}
          onChangeProgramme={() => setProgramme(null)}
          selectedDate={logDate}
          onDateChange={setLogDate}
          waterTrigger={waterTrigger} // <--- AM ADĂUGAT PROP-UL AICI
        />
      )}

      {activeTab === 'search' && (
        <FoodSearch 
          onAdd={handleAddFood} 
          onClose={() => setActiveTab('dashboard')} 
          selectedDate={logDate}
          onWaterUpdate={() => setWaterTrigger(prev => prev + 1)} // <--- AM ADĂUGAT PROP-UL AICI
        />
      )}

      {activeTab === 'progress' && (
        <WeeklyProgress />
      )}

      {activeTab === 'profile' && (
        <ProfileView />
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;