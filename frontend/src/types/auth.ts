import { ProgrammeType } from "./nutrition";

export interface User {
  id: number;
  name: string;
  email: string;
  photo_url?: string | null;
  avatarDataUrl?: string;
  created_at?: string;
  programme: ProgrammeType | null;
  notifications_enabled?: boolean;

  // Date fizice
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  sex?: "male" | "female" | null;
  activity_level?: "sedentary" | "light" | "moderate" | "active" | null;

  // Targeturi calculate de backend
  daily_calories?: number | null;
  daily_targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  } | null;
}