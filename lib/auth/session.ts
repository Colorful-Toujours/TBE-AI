export type StoredUser = {
  id?: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
};

const USER_STORAGE_KEY = "user";

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getUserInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  return trimmed.slice(0, 1).toUpperCase();
}
