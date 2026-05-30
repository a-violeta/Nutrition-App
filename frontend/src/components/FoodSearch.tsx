import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Sparkles, Send, Loader2 } from 'lucide-react';
import { Food, FoodLogEntry } from '@/types/nutrition';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const API =
  window.location.port === "8080"
    ? "http://localhost:8000"
    : "";

interface FoodSearchProps {
  onAdd: (food: Food, meal: FoodLogEntry['mealType']) => void;
  onClose: () => void;
}

const meals: { id: FoodLogEntry['mealType']; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snack', label: 'Snack', icon: '🍿' },
];

export function FoodSearch({ onAdd, onClose }: FoodSearchProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [query, setQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<FoodLogEntry['mealType']>('lunch');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // ── Fetch foods din backend ───────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoadingFoods(true);
      try {
        const params = query.trim() ? `?search=${encodeURIComponent(query)}` : '';
        const res = await fetch(`${API}/foods/${params}`);
        if (res.ok) setFoods(await res.json());
      } catch {
        setFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // ── AI recommendation ─────────────────────────────────────────────────────
  const handleAIRecommend = async () => {
    if (!aiPrompt.trim() || !token) return;
    setLoadingAI(true);
    setAiResponse('');
    try {
      const res = await fetch(`${API}/ai/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          programme: user?.programme ?? null,
        }),
      });
      if (!res.ok) {
        setAiResponse('Could not get recommendation. Make sure Ollama is running.');
        return;
      }
      const data = await res.json();
      setAiResponse(data.recommendation);
    } catch {
      setAiResponse('Could not connect to AI. Make sure Ollama is running locally.');
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
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-foreground">Add Food</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm font-medium">
            Cancel
          </button>
        </div>

        {/* Toggle AI / Search */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAI(false)}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1',
              !showAI ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'
            )}
          >
            <Search size={14} /> Search
          </button>
          <button
            onClick={() => setShowAI(true)}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1',
              showAI ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground'
            )}
          >
            <Sparkles size={14} /> AI Recommend
          </button>
        </div>

        {/* Meal selector */}
        <div className="flex gap-2">
          {meals.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMeal(m.id)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                selectedMeal === m.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-2">
        <AnimatePresence mode="wait">
          {!showAI ? (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Search input */}
              <div className="relative mb-4">
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

              {/* Food list */}
              {loadingFoods && (
                <p className="text-center text-muted-foreground py-8 text-sm">Loading...</p>
              )}
              <div className="space-y-2">
                {!loadingFoods && foods.map((food, i) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{food.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {food.calories} cal · P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g
                      </p>
                    </div>
                    <button
                      onClick={() => onAdd(food, selectedMeal)}
                      className="ml-3 w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0"
                    >
                      <Plus size={16} className="text-primary-foreground" />
                    </button>
                  </motion.div>
                ))}
                {!loadingFoods && foods.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No foods found.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* AI input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIRecommend()}
                  placeholder="e.g. something sweet but low calorie..."
                  className="flex-1 h-11 px-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button
                  onClick={handleAIRecommend}
                  disabled={loadingAI || !aiPrompt.trim()}
                  className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                >
                  {loadingAI
                    ? <Loader2 size={16} className="text-primary-foreground animate-spin" />
                    : <Send size={16} className="text-primary-foreground" />
                  }
                </button>
              </div>

              {/* AI response */}
              {loadingAI && (
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    AI is thinking...
                  </div>
                </div>
              )}

              {aiResponse && !loadingAI && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Recommendation</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                </motion.div>
              )}

              {!aiResponse && !loadingAI && (
                <div className="text-center py-8">
                  <Sparkles size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Ask AI for food recommendations based on your goals!</p>
                  <p className="text-xs text-muted-foreground mt-1">Example: "something high in protein and low in fat"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
