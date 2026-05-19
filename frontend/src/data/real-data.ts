import { Food, Programme, FoodLogEntry } from '@/types/nutrition';

export const PROGRAMMES: Programme[] = [
  {
    id: 'weight_loss',
    name: 'Weight Loss',
    description: 'Calorie deficit with balanced macros',
    icon: '🔥',
    focusNutrients: ['calories', 'fat', 'fiber'],
    dailyTargets: { calories: 1800, protein: 90, carbs: 200, fat: 50, fiber: 30, sodium: 2300 },
  },
  {
    id: 'protein_gain',
    name: 'Protein Gain',
    description: 'High protein for muscle building',
    icon: '💪',
    focusNutrients: ['protein', 'calories'],
    dailyTargets: { calories: 2800, protein: 180, carbs: 300, fat: 80, fiber: 25, sodium: 2500 },
  },
  {
    id: 'glucose_watch',
    name: 'Glucose Watch',
    description: 'Low carb, high fiber monitoring',
    icon: '🩸',
    focusNutrients: ['carbs', 'fiber'],
    dailyTargets: { calories: 2000, protein: 100, carbs: 130, fat: 70, fiber: 35, sodium: 2300 },
  },
  {
    id: 'sodium_watch',
    name: 'Sodium Watch',
    description: 'Low sodium for heart health',
    icon: '❤️',
    focusNutrients: ['sodium', 'calories'],
    dailyTargets: { calories: 2000, protein: 100, carbs: 250, fat: 65, fiber: 28, sodium: 1500 },
  },
];
