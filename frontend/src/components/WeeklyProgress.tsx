import { useEffect, useState } from 'react';
import { fetchFoodLog } from '@/api/food-log';
import { useAuthStore } from '@/lib/auth-store';
import { DailyNutrition, FoodLogEntry } from '@/types/nutrition';

const toDateString = (d: Date) => d.toISOString().split('T')[0];

function sumDay(entries: FoodLogEntry[]): DailyNutrition {
  const totals: DailyNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
  for (const e of entries) {
    const qty = e.quantity ?? 1;
    totals.calories += (e.food.calories ?? 0) * qty;
    totals.protein += (e.food.protein ?? 0) * qty;
    totals.carbs += (e.food.carbs ?? 0) * qty;
    totals.fat += (e.food.fat ?? 0) * qty;
    totals.fiber += (e.food.fiber ?? 0) * qty;
    totals.sodium += (e.food.sodium ?? 0) * qty;
  }
  return totals;
}

export function WeeklyProgress() {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<{ date: string; label: string; totals: DailyNutrition }[]>([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const dates: Date[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          dates.push(d);
        }

        const promises = dates.map((d) => fetchFoodLog(token, toDateString(d)).catch(() => []));
        const results = await Promise.all(promises);

        const dayTotals = results.map((res: any[], idx) => {
          const entries: FoodLogEntry[] = res.map((e: any) => ({
            id: String(e.id),
            food: e.food,
            quantity: e.quantity,
            mealType: e.meal_type,
            timestamp: new Date(e.date),
          }));
          return {
            date: toDateString(dates[idx]),
            label: dates[idx].toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            totals: sumDay(entries),
          };
        });

        if (!cancelled) setDays(dayTotals);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const weekTotals = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.totals.calories,
      protein: acc.protein + d.totals.protein,
      carbs: acc.carbs + d.totals.carbs,
      fat: acc.fat + d.totals.fat,
      fiber: acc.fiber + d.totals.fiber,
      sodium: acc.sodium + d.totals.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 } as DailyNutrition
  );

  const maxCal = Math.max(...days.map((d) => d.totals.calories), 2000);

  if (!token) return <div className="p-4">Please sign in to view progress.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Weekly Progress</h2>
      <p className="text-sm text-muted-foreground">Last 7 days overview</p>

      {loading && <div className="mt-4">Loading...</div>}

      {!loading && (
        <div className="mt-4 space-y-3">
          {days.map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <div className="w-28 text-sm text-muted-foreground">{d.label}</div>
              <div className="flex-1 bg-muted/30 rounded h-3 overflow-hidden">
                <div
                  className="h-3 bg-primary"
                  style={{ width: `${Math.round((d.totals.calories / maxCal) * 100)}%` }}
                />
              </div>
              <div className="w-20 text-right text-sm font-medium">{Math.round(d.totals.calories)} kcal</div>
            </div>
          ))}

          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between text-sm">
              <div className="text-muted-foreground">Week total</div>
              <div className="font-semibold">{Math.round(weekTotals.calories)} kcal</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
              <div>Protein: {Math.round(weekTotals.protein)} g</div>
              <div>Carbs: {Math.round(weekTotals.carbs)} g</div>
              <div>Fat: {Math.round(weekTotals.fat)} g</div>
              <div>Fiber: {Math.round(weekTotals.fiber)} g</div>
              <div>Sodium: {Math.round(weekTotals.sodium)} mg</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyProgress;
