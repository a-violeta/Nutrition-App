import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { Food, FoodLogEntry } from '@/types/nutrition';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

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
  
  //console.log("FOOD SEARCH PAGE RENDERED");

  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<FoodLogEntry['mealType']>('lunch');

  useEffect(() => {
    fetch("/food-log/foods")
      .then((r) => r.json())
      .then((data) => {
        //console.log("FOODS FROM API:", data);
        setFoods(data);
      })
      .catch((err) => {
        console.error("FOOD FETCH ERROR:", err);
        setFoods([]);
      });
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return foods;

    return foods.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, foods]);

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-background z-50 flex flex-col h-full"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-foreground">Add Food</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm font-medium">
            Cancel
          </button>
        </div>

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

      <div className="flex-1 overflow-y-auto px-4 pb-safe space-y-2">
        <AnimatePresence>
          {results.map((food, i) => (
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
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
