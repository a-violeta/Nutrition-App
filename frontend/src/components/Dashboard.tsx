import { motion, AnimatePresence } from 'framer-motion';
import { NutrientRing } from '@/components/NutrientRing';
import { NutrientBar } from '@/components/NutrientBar';
import { FoodLogItem } from '@/components/FoodLogItem';
import { FoodLogEntry } from '@/types/nutrition';
import { calculateDailyTotals, getProgramme } from '@/lib/nutrition-store';
import { ProgrammeType } from '@/types/nutrition';
import { useAuthStore } from "@/lib/auth-store";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  programme: ProgrammeType;
  foodLog: FoodLogEntry[];
  onRemoveEntry: (id: string) => void;
  onChangeProgramme: () => void;
}

export function Dashboard({ programme, foodLog, onRemoveEntry, onChangeProgramme }: DashboardProps) {
  const prog = getProgramme(programme)!;
  const totals = calculateDailyTotals(foodLog);
  const targets = prog.dailyTargets;

  const caloriePercent = Math.round((totals.calories / (targets.calories || 2000)) * 100);
  const remaining = Math.max(0, (targets.calories || 2000) - totals.calories);

  const updateProgramme = useAuthStore((s) => s.updateProgramme);
  const navigate = useNavigate();

  return (
    <div className="pb-24 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Today's Progress</p>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {prog.icon} {prog.name}
          </h1>
        </div>
        <button
          onClick={async () => {
            await updateProgramme(null); // sterge programme curent
            navigate("/");               // redirect la programme select (pt ca nu avem programme, asta se intampla)
          }}
          className="text-xs text-primary font-medium hover:underline"
        >
          Change
        </button>
      </div>

      {/* Calorie Ring Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-8">
          <NutrientRing
            value={totals.calories}
            max={targets.calories || 2000}
            size={120}
            strokeWidth={10}
            color="hsl(var(--nutrient-calories))"
            label="Calories"
          />
          <div className="space-y-1">
            <div className="text-3xl font-heading font-bold text-foreground">{remaining}</div>
            <div className="text-sm text-muted-foreground">remaining</div>
            <div className="text-xs text-muted-foreground">{caloriePercent}% of daily goal</div>
          </div>
        </div>

        {/* Macro Rings */}
        <div className="flex justify-around mt-6 pt-4 border-t border-border">
          <NutrientRing value={totals.protein} max={targets.protein || 100} size={60} strokeWidth={5} color="hsl(var(--nutrient-protein))" label="Protein" />
          <NutrientRing value={totals.carbs} max={targets.carbs || 250} size={60} strokeWidth={5} color="hsl(var(--nutrient-carbs))" label="Carbs" />
          <NutrientRing value={totals.fat} max={targets.fat || 65} size={60} strokeWidth={5} color="hsl(var(--nutrient-fat))" label="Fat" />
          <NutrientRing value={totals.fiber} max={targets.fiber || 30} size={60} strokeWidth={5} color="hsl(var(--nutrient-fiber))" label="Fiber" />
        </div>
      </motion.div>

      {/* Focused Nutrient Bars */}
      <div className="glass-card rounded-2xl p-5 mb-6 space-y-4">
        <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Nutrient Breakdown</h2>
        <NutrientBar label="Calories" value={totals.calories} max={targets.calories || 2000} color="hsl(var(--nutrient-calories))" unit=" kcal" />
        <NutrientBar label="Protein" value={totals.protein} max={targets.protein || 100} color="hsl(var(--nutrient-protein))" />
        <NutrientBar label="Carbs" value={totals.carbs} max={targets.carbs || 250} color="hsl(var(--nutrient-carbs))" />
        <NutrientBar label="Fat" value={totals.fat} max={targets.fat || 65} color="hsl(var(--nutrient-fat))" />
        <NutrientBar label="Fiber" value={totals.fiber} max={targets.fiber || 30} color="hsl(var(--nutrient-fiber))" />
        <NutrientBar label="Sodium" value={totals.sodium} max={targets.sodium || 2300} color="hsl(var(--nutrient-sodium))" unit=" mg" />
      </div>

      {/* Food Log */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Today's Log ({foodLog.length} items)
        </h2>
        <div className="space-y-2">
          <AnimatePresence>
            {foodLog.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No foods logged yet. Tap + to add your first meal!
              </p>
            ) : (
              foodLog.map(entry => (
                <FoodLogItem key={entry.id} entry={entry} onRemove={onRemoveEntry} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
