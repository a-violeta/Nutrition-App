import { useState } from 'react';
import { FoodLogEntry } from '@/types/nutrition';
import { Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodLogItemProps {
  entry: FoodLogEntry;
  onRemove: (id: string) => void;
}

export function FoodLogItem({ entry, onRemove }: FoodLogItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mealIcons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍿',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col p-3 rounded-lg bg-secondary/50 group transition-colors hover:bg-secondary/70"
    >
      {/* Rândul principal - Clickabil pentru a extinde */}
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-xl flex-shrink-0">{mealIcons[entry.mealType]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {entry.food.name} {entry.quantity > 1 ? `×${entry.quantity}` : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              {Number((entry.food.calories * entry.quantity).toFixed(2))} cal · {Number((entry.food.protein * entry.quantity).toFixed(2))}g protein
            </p>
          </div>
          
          {/* Săgeata care se rotește */}
          <motion.div 
            animate={{ rotate: isExpanded ? 180 : 0 }} 
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 text-muted-foreground mr-2"
          >
            <ChevronDown size={18} />
          </motion.div>
        </div>

        {/* Butonul de ștergere (oprit de la a declanșa expansiunea) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Previne deschiderea/închiderea containerului la click pe coș
            onRemove(entry.id);
          }}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Containerul expandabil pentru ingrediente și extra macro */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-border/50 text-xs">
              
              {/* Lista de ingrediente (dacă există în datele de la backend) */}
              {entry.food.ingredients && entry.food.ingredients.length > 0 ? (
                <ul className="space-y-1.5 mb-3">
                  {entry.food.ingredients.map((ing: any, idx: number) => (
                    <li key={idx} className="flex justify-between items-center text-muted-foreground">
                      {/* FIX GRAMAJ CU 2 ZECIMALE */}
                      <span>• {ing.ingredient?.name || 'Ingredient'} ({Number((ing.amount_g * entry.quantity).toFixed(2))}g)</span>
                      <span className="font-medium text-foreground/70">
                        {Number(((ing.amount_g / 100) * (ing.ingredient?.calories_per_100g || 0) * entry.quantity).toFixed(2))} cal
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground/60 italic mb-3">No individual ingredients listed.</p>
              )}

              {/* Tabel extra de macronutrienți */}
              <div className="flex justify-between items-center p-2 rounded bg-background/50 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <span className="text-blue-500/80 dark:text-blue-400">Carbs: {Number((entry.food.carbs * entry.quantity).toFixed(2))}g</span>
                <span className="text-yellow-600/80 dark:text-yellow-500">Fat: {Number((entry.food.fat * entry.quantity).toFixed(2))}g</span>
                <span className="text-green-600/80 dark:text-green-500">Fiber: {Number((entry.food.fiber * entry.quantity).toFixed(2))}g</span>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}