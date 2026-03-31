import { ProgrammeType, FoodLogEntry } from '@/types/nutrition';
import { PROGRAMMES } from '@/data/mock-data';

export function getInitialProgramme(): ProgrammeType | null {
  const saved = localStorage.getItem('selectedProgramme');
  return saved as ProgrammeType | null;
}

export function saveProgramme(p: ProgrammeType) {
  localStorage.setItem('selectedProgramme', p);
}

export function getProgramme(id: ProgrammeType) {
  return PROGRAMMES.find(p => p.id === id);
}

export function calculateDailyTotals(entries: FoodLogEntry[]) {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.food.calories * entry.quantity,
      protein: acc.protein + entry.food.protein * entry.quantity,
      carbs: acc.carbs + entry.food.carbs * entry.quantity,
      fat: acc.fat + entry.food.fat * entry.quantity,
      fiber: acc.fiber + entry.food.fiber * entry.quantity,
      sodium: acc.sodium + entry.food.sodium * entry.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );
}
