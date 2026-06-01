import { useEffect, useState } from 'react';
import { fetchFoodLog } from '@/api/food-log';
import { useAuthStore } from '@/lib/auth-store';
import { DailyNutrition, FoodLogEntry } from '@/types/nutrition';

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ADD THIS INSTEAD
const toDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Funcția pentru calculul personalizat al apei (33ml / kg corp)
export function getDailyWaterGoal(weightKg?: number): number {
  if (!weightKg || weightKg <= 0) {
    return 2000; // Valoarea default dacă userul nu are greutatea setată
  }
  return Math.round(weightKg * 33);
}

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

// Funcție pentru a aduce apa pe o anumită zi
async function fetchWaterLog(token: string, dateStr: string): Promise<number> {
  try {
    const res = await fetch(`${API}/water/daily?date=${dateStr}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total_ml ?? 0;
  } catch {
    return 0;
  }
}

export function WeeklyProgress() {
  const token = useAuthStore((s) => s.token);
  // Presupunem că datele utilizatorului sunt salvate în store
  const user = useAuthStore((s: any) => s.user); 
  
  // Calculăm targetul dinamic pe baza greutății utilizatorului
  const dailyWaterGoal = getDailyWaterGoal(user?.weight);

  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<{ date: string; label: string; totals: DailyNutrition; water_ml: number }[]>([]);

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

        // 1. Fetch mâncare
        const foodPromises = dates.map((d) => fetchFoodLog(token, toDateString(d)).catch(() => []));
        // 2. Fetch apă
        const waterPromises = dates.map((d) => fetchWaterLog(token, toDateString(d)));

        const foodResults = await Promise.all(foodPromises);
        const waterResults = await Promise.all(waterPromises);

        const dayTotals = foodResults.map((res: any[], idx) => {
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
            water_ml: waterResults[idx], // Adăugăm apa aici
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
      water: acc.water + d.water_ml, // Adăugăm totalul de apă
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, water: 0 }
  );

  const maxCal = Math.max(...days.map((d) => d.totals.calories), 2000);

  if (!token) return <div className="p-4">Please sign in to view progress.</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Weekly Progress</h2>
      <p className="text-sm text-muted-foreground">Last 7 days overview (Water Goal: {dailyWaterGoal} ml)</p>

      {loading && <div className="mt-4">Loading...</div>}

      {!loading && (
        <div className="mt-4 space-y-4">
          {days.map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <div className="w-28 text-sm text-muted-foreground">{d.label}</div>
              
              <div className="flex-1 flex flex-col gap-1.5">
                {/* Bara pentru Calorii */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/30 rounded h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 bg-primary rounded"
                      style={{ width: `${Math.round((d.totals.calories / maxCal) * 100)}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs font-medium text-foreground">{Math.round(d.totals.calories)} kcal</div>
                </div>
                
                {/* Bara pentru Apă (folosind dailyWaterGoal) */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-500/10 dark:bg-blue-900/20 rounded h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 bg-blue-500 rounded transition-all"
                      style={{ width: `${Math.min(100, Math.round((d.water_ml / dailyWaterGoal) * 100))}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs font-medium text-blue-500">{d.water_ml} ml</div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-sm mb-3">
              <div className="text-muted-foreground font-medium">Week total</div>
              <div className="font-semibold flex gap-4">
                <span>{Math.round(weekTotals.calories)} kcal</span>
                <span className="text-blue-500">{weekTotals.water} ml</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <div><span className="font-medium text-foreground">Protein:</span> {Math.round(weekTotals.protein)} g</div>
              <div><span className="font-medium text-foreground">Carbs:</span> {Math.round(weekTotals.carbs)} g</div>
              <div><span className="font-medium text-foreground">Fat:</span> {Math.round(weekTotals.fat)} g</div>
              <div><span className="font-medium text-foreground">Fiber:</span> {Math.round(weekTotals.fiber)} g</div>
              <div><span className="font-medium text-foreground">Sodium:</span> {Math.round(weekTotals.sodium)} mg</div>
              <div><span className="font-medium text-blue-500">Water avg:</span> {Math.round(weekTotals.water / 7)} ml/day</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyProgress;