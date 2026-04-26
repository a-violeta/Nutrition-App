import { User } from '@/types/auth';

const USER_KEY = 'auth.currentUser';

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}
