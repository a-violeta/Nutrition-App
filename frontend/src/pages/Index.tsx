import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Food, FoodLogEntry } from '@/types/nutrition';
import { MOCK_LOG } from '@/data/mock-data';
import { AuthScreen } from '@/components/AuthScreen';
import { ProgrammeSelect } from '@/components/ProgrammeSelect';
import { Dashboard } from '@/components/Dashboard';
import { FoodSearch } from '@/components/FoodSearch';
import { ProfileView } from '@/components/ProfileView';
import { BottomNav } from '@/components/BottomNav';
import { useAuthStore } from "@/lib/auth-store";

const Index = () => {
  // User vine din store, nu din localStorage
  const user = useAuthStore((s) => s.user);

  //const logout = useAuthStore((s) => s.logout);

  //programme corect
  const programme = user?.programme ?? null;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>(MOCK_LOG);

  const handleAddFood = useCallback((food: Food, mealType: FoodLogEntry['mealType']) => {
    const entry: FoodLogEntry = {
      id: Date.now().toString(),
      food,
      quantity: 1,
      mealType,
      timestamp: new Date(),
    };
    setFoodLog(prev => [...prev, entry]);
    setShowSearch(false);
    setActiveTab('dashboard');
  }, []);

  const handleRemoveEntry = useCallback((id: string) => {
    setFoodLog(prev => prev.filter(e => e.id !== id));
  }, []);

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
          onChangeProgramme={() => {}}
        />
      )}

      {activeTab === 'search' && (
        <FoodSearch onAdd={handleAddFood} onClose={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'profile' && (
        <ProfileView
          programme={programme}
        />
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
