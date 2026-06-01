import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Sparkles, Send, Loader2, ChevronDown } from 'lucide-react';
import { Food, FoodLogEntry } from '@/types/nutrition';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import WaterTracker from './WaterTracker';

const API = import.meta.env.DEV ? "http://localhost:8000" : "";

interface FoodSearchProps {
  onAdd: (food: Food, meal: FoodLogEntry['mealType']) => void; 
  onClose: () => void;
  selectedDate?: Date;
  onWaterUpdate?: () => void; // <--- AM ADĂUGAT ASTA
}

const meals: { id: FoodLogEntry['mealType']; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snack', icon: '🍿' },
];

// <--- AM ADĂUGAT onWaterUpdate AICI
export function FoodSearch({ onAdd, onClose, selectedDate = new Date(), onWaterUpdate }: FoodSearchProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  // --- STATE ---
  const [query, setQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<FoodLogEntry['mealType']>('lunch');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [addingFoodId, setAddingFoodId] = useState<number | null>(null);
  
  // State pentru Dropdown-ul cu ingrediente
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [mode, setMode] = useState<'search' | 'ai' | 'water'>('search');

  // --- FETCH FOODS (Se face o singură dată) ---
  useEffect(() => {
    const fetchAllFoods = async () => {
      setLoadingFoods(true);
      try {
        const res = await fetch(`${API}/foods/`);
        if (res.ok) setFoods(await res.json());
      } catch {
        setFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };
    fetchAllFoods();
  }, []);

  // --- FILTRARE INTELIGENTĂ ---
  const filteredFoods = foods.filter((food) => {
    const matchesQuery = food.name.toLowerCase().includes(query.toLowerCase());
    // Verificăm dacă tab-ul (ex: "breakfast") e în lista meal_tags a alimentului
    const matchesMeal = food.meal_tags && food.meal_tags.includes(selectedMeal);
    
    // Dacă ai scris ceva în bara de căutare, arată tot ce se potrivește (ignoră tab-urile)
    if (query.trim() !== '') {
      return matchesQuery;
    }
    // Dacă bara e goală, arată doar mâncărurile din tab-ul selectat
    return matchesMeal;
  });

  // --- ADĂUGARE MÂNCARE ---
  const handleAddFoodToLog = async (food: Food) => {
    if (!token) return;
    setAddingFoodId(food.id);

    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`${API}/food-log/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          food_id: food.id,
          quantity: 1.0,
          meal_type: selectedMeal,
          date: dateString
        })
      });

      if (res.ok) {
        onAdd(food, selectedMeal);
        onClose();
      } else {
        alert("Eroare la adăugarea mâncării.");
      }
    } catch (error) {
      alert("Nu s-a putut conecta la server.");
    } finally {
      setAddingFoodId(null);
    }
  };

  // --- AI RECOMMENDATION ---
  const handleAIRecommend = async () => {
    if (!aiPrompt.trim() || !token) return;
    setLoadingAI(true);
    setAiResponse('');
    try {
      const res = await fetch(`${API}/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: aiPrompt, programme: user?.programme ?? null }),
      });
      if (!res.ok) { setAiResponse('Could not get recommendation.'); return; }
      const data = await res.json();
      setAiResponse(data.recommendation);
    } catch {
      setAiResponse('Could not connect to AI.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* HEADER */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-foreground">Add Food</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm font-medium">
            Cancel
          </button>
        </div>

        {/* TOGGLE MODES */}
        <div className="flex gap-2">
          <button onClick={() => setMode('search')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all', mode === 'search' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground')}>
            <Search size={14} /> Search
          </button>
          <button onClick={() => setMode('ai')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all', mode === 'ai' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground')}>
            <Sparkles size={14} /> AI
          </button>
          <button onClick={() => setMode('water')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all', mode === 'water' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground')}>
            💧 Water
          </button>
        </div>

        {/* MEAL TABS */}
        <div className="flex gap-2">
          {meals.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMeal(m.id)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                selectedMeal === m.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'
              )}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT (Scrollabil) */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-2">
        <AnimatePresence mode="wait">
          
          {/* MOD SEARCH & LISTĂ MÂNCARE */}
          {mode === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search foods..."
                  autoFocus
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {loadingFoods && <p className="text-center text-muted-foreground py-8 text-sm">Loading...</p>}
              
              <div className="space-y-2">
                {!loadingFoods && filteredFoods.map((food, i) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-xl bg-card border border-border overflow-hidden"
                  >
                    {/* Rândul Principal (Clickable pt. expandare) */}
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedId(expandedId === food.id ? null : food.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{food.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Number((food.calories || 0).toFixed(2))} kcal · P: {Number((food.protein || 0).toFixed(2))}g · C: {Number((food.carbs || 0).toFixed(2))}g · F: {Number((food.fat || 0).toFixed(2))}g · Fib: {Number((food.fiber || 0).toFixed(2))}g · Na: {Number((food.sodium || 0).toFixed(2))}mg
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-2">
                        <ChevronDown 
                          size={18} 
                          className={cn("text-muted-foreground transition-transform duration-200", expandedId === food.id ? "rotate-180" : "")} 
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Oprim click-ul să nu deschidă/închidă accordion-ul
                            handleAddFoodToLog(food);
                          }}
                          disabled={addingFoodId === food.id}
                          className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                        >
                          {addingFoodId === food.id ? (
                            <Loader2 size={16} className="text-primary-foreground animate-spin" />
                          ) : (
                            <Plus size={16} className="text-primary-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Zona Expandabilă (Ingrediente) */}
                    <AnimatePresence>
                      {expandedId === food.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-3 pb-3 border-t border-border/50 bg-secondary/10"
                        >
                          <div className="pt-2 text-xs">
                            <p className="font-semibold text-foreground/80 mb-2">Ingredients & Recipe:</p>
                            {food.ingredients && food.ingredients.length > 0 ? (
                              <ul className="space-y-1.5">
                                {food.ingredients.map((ing: any, idx: number) => (
                                  <li key={idx} className="flex justify-between items-center text-muted-foreground">
                                    <span>• {ing.ingredient?.name || 'Ingredient'} <span className="text-foreground/50">({Number(ing.amount_g.toFixed(2))}g)</span></span>
                                    <span className="font-medium text-foreground/70">
                                      {Number(((ing.amount_g / 100) * (ing.ingredient?.calories_per_100g || 0)).toFixed(2))} kcal
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted-foreground/60 italic">Basic ingredient.</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {!loadingFoods && filteredFoods.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No foods found. Try a different search or meal tab.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ... AI și Water rămân exact la fel ... */}
          {mode === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIRecommend()}
                  placeholder="e.g. something sweet but low calorie..."
                  className="flex-1 h-11 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button onClick={handleAIRecommend} disabled={loadingAI || !aiPrompt.trim()} className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50">
                  {loadingAI ? <Loader2 size={16} className="text-primary-foreground animate-spin" /> : <Send size={16} className="text-primary-foreground" />}
                </button>
              </div>
              {/* Afișare AI */}
              {loadingAI && <div className="glass-card rounded-2xl p-4"><div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 size={14} className="animate-spin" /> AI is thinking...</div></div>}
              {aiResponse && !loadingAI && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3"><Sparkles size={14} className="text-primary" /><span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Recommendation</span></div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                </motion.div>
              )}
            </motion.div>
          )}

         {mode === 'water' && (
            <motion.div key="water" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <WaterTracker 
                token={token} 
                selectedDate={selectedDate} // <--- ADD THIS LINE
                onUpdate={onWaterUpdate} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}