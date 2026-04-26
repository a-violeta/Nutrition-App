import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgrammeType, Food, FoodLogEntry } from '@/types/nutrition';
import { User } from '@/types/auth';
import { getInitialProgramme } from '@/lib/nutrition-store';
import { getCurrentUser, clearCurrentUser } from '@/lib/auth-store';
import { MOCK_LOG } from '@/data/mock-data';
import { AuthScreen } from '@/components/AuthScreen';
import { ProgrammeSelect } from '@/components/ProgrammeSelect';
import { Dashboard } from '@/components/Dashboard';
import { FoodSearch } from '@/components/FoodSearch';
import { ProfileView } from '@/components/ProfileView';
import { BottomNav } from '@/components/BottomNav';

const Index = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser);
  const [programme, setProgramme] = useState<ProgrammeType | null>(getInitialProgramme);

  const handleLogout = useCallback(() => {
    clearCurrentUser();
    setUser(null);
  }, []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>(MOCK_LOG);

  const handleSelectProgramme = useCallback((p: ProgrammeType) => {
    setProgramme(p);
    setActiveTab('dashboard');
  }, []);

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

  // Auth gate
  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  // Onboarding: programme selection
  if (!programme) {
    return <ProgrammeSelect onSelect={handleSelectProgramme} />;
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {activeTab === 'dashboard' && (
        <Dashboard
          programme={programme}
          foodLog={foodLog}
          onRemoveEntry={handleRemoveEntry}
          onChangeProgramme={() => setProgramme(null)}
        />
      )}

      {activeTab === 'search' && (
        <FoodSearch onAdd={handleAddFood} onClose={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'profile' && (
        <ProfileView
          user={user}
          programme={programme}
          onChangeProgramme={() => setProgramme(null)}
          onLogout={handleLogout}
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
