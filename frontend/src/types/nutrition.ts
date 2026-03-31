export interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export type ProgrammeType = 'weight_loss' | 'protein_gain' | 'glucose_watch' | 'sodium_watch';

export interface Programme {
  id: ProgrammeType;
  name: string;
  description: string;
  icon: string;
  focusNutrients: (keyof Pick<Food, 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sodium'>)[];
  dailyTargets: Partial<Record<string, number>>;
}

export interface FoodLogEntry {
  id: string;
  food: Food;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
}

export interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}
