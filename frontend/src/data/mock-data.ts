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

export const MOCK_FOODS: Food[] = [
  { id: 1, name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
  { id: 2, name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sodium: 10 },
  { id: 3, name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sodium: 1 },
  { id: 4, name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sodium: 36 },
  { id: 5, name: 'Salmon Fillet', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sodium: 59 },
  { id: 6, name: 'Avocado (half)', calories: 120, protein: 1.5, carbs: 6, fat: 11, fiber: 5, sodium: 5 },
  { id: 7, name: 'Egg (boiled)', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sodium: 62 },
  { id: 8, name: 'Oatmeal (1 cup)', calories: 154, protein: 5, carbs: 27, fat: 2.6, fiber: 4, sodium: 2 },
  { id: 9, name: 'Spinach (100g)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79 },
  { id: 10, name: 'Sweet Potato', calories: 103, protein: 2.3, carbs: 24, fat: 0.1, fiber: 3.8, sodium: 41 },
  { id: 11, name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sodium: 1 },
  { id: 12, name: 'Whole Wheat Bread', calories: 69, protein: 3.6, carbs: 12, fat: 1, fiber: 1.9, sodium: 132 },
];

export const MOCK_LOG: FoodLogEntry[] = [
  { id: '1', food: MOCK_FOODS[7], quantity: 1, mealType: 'breakfast', timestamp: new Date() },
  { id: '2', food: MOCK_FOODS[2], quantity: 1, mealType: 'breakfast', timestamp: new Date() },
  { id: '3', food: MOCK_FOODS[0], quantity: 1, mealType: 'lunch', timestamp: new Date() },
  { id: '4', food: MOCK_FOODS[1], quantity: 1, mealType: 'lunch', timestamp: new Date() },
  { id: '5', food: MOCK_FOODS[8], quantity: 2, mealType: 'lunch', timestamp: new Date() },
];
