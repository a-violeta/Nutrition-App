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
}
