import { FoodLogEntry } from '@/types/nutrition';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodLogItemProps {
  entry: FoodLogEntry;
  onRemove: (id: string) => void;
}

export function FoodLogItem({ entry, onRemove }: FoodLogItemProps) {
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
      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl flex-shrink-0">{mealIcons[entry.mealType]}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {entry.food.name} {entry.quantity > 1 ? `×${entry.quantity}` : ''}
          </p>
          <p className="text-xs text-muted-foreground">
            {entry.food.calories * entry.quantity} cal · {entry.food.protein * entry.quantity}g protein
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(entry.id)}
        className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}
