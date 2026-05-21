import { motion, AnimatePresence } from 'framer-motion';
import { NutrientRing } from '@/components/NutrientRing';
import { NutrientBar } from '@/components/NutrientBar';
import { FoodLogItem } from '@/components/FoodLogItem';
import { FoodLogEntry } from '@/types/nutrition';
import { calculateDailyTotals, getProgramme } from '@/lib/nutrition-store';
import { ProgrammeType } from '@/types/nutrition';
import { useAuthStore } from "@/lib/auth-store";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  programme: ProgrammeType;
  foodLog: FoodLogEntry[];
  onRemoveEntry: (id: string) => void;
  onChangeProgramme: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const toDateString = (d: Date) => d.toISOString().split("T")[0];
const isToday = (d: Date) => toDateString(d) === toDateString(new Date());

const formatDate = (d: Date) => {
  if (isToday(d)) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (toDateString(d) === toDateString(yesterday)) return "Yesterday";
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const PROGRAMME_DISPLAY = {
  "weight_loss": {
    metric: "calories",
    label: "Calories",
    color: "hsl(var(--nutrient-calories))",
    unit: "kcal",
    fallback: 2000,
  },

  "protein_gain": {
    metric: "protein",
    label: "Protein",
    color: "hsl(var(--nutrient-protein))",
    unit: "g",
    fallback: 100,
  },

  "glucose_watch": {
    metric: "carbs",
    label: "Carbs",
    color: "hsl(var(--nutrient-carbs))",
    unit: "g",
    fallback: 250,
  },

  "sodium_watch": {
    metric: "sodium",
    label: "Sodium",
    color: "hsl(var(--nutrient-sodium))",
    unit: "mg",
    fallback: 2300,
  },
} as const;

export function Dashboard({ programme, foodLog, onRemoveEntry, onChangeProgramme, selectedDate, onDateChange }: DashboardProps) {
  const prog = getProgramme(programme)!;
  const totals = calculateDailyTotals(foodLog);
  const targets = prog.dailyTargets;

  const display = PROGRAMME_DISPLAY[programme];

  const currentValue = totals[display.metric];
  const maxValue = targets[display.metric] || display.fallback;

  const progressPercent = Math.round((currentValue / maxValue) * 100);

  const remaining = Math.max(0, maxValue - currentValue);

  //console.log(programme);

  const updateProgramme = useAuthStore((s) => s.updateProgramme);
  const navigate = useNavigate();

  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const goToNextDay = () => {
    if (isToday(selectedDate)) return; // nu putem merge în viitor
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  return (
    <div className="pb-24 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Daily Progress</p>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {prog.icon} {prog.name}
          </h1>
        </div>
        <button
          onClick={async () => {
            await updateProgramme(null);
            navigate("/");
          }}
          className="text-xs text-primary font-medium hover:underline"
        >
          Change
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center justify-center gap-4 mb-6 glass-card rounded-2xl py-3 px-4">
        <button
          onClick={goToPrevDay}
          className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
        </button>
        <span className="font-heading font-semibold text-foreground text-sm min-w-[100px] text-center">
          {formatDate(selectedDate)}
        </span>
        <button
          onClick={goToNextDay}
          disabled={isToday(selectedDate)}
          className="p-1 rounded-full hover:bg-secondary/50 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Nutrient Ring Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-8">
          <NutrientRing
            value={currentValue}
            max={maxValue}
            size={120}
            strokeWidth={10}
            color={display.color}
            label={display.label}
          />
          <div className="space-y-1">
            <div className="text-3xl font-heading font-bold text-foreground">{remaining}</div>
            <div className="text-sm text-muted-foreground">remaining</div>
            <div className="text-xs text-muted-foreground">{progressPercent}% of daily goal</div>
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

      {/* Nutrient Bars */}
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
          {formatDate(selectedDate)}'s Log ({foodLog.length} items)
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
