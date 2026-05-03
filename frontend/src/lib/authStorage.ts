import type { Role, User } from "@/types/auth";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredAuthToken() {
  if (!canUseStorage()) return null;

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function hasStoredAuthToken() {
  return Boolean(getStoredAuthToken());
}

export function getStoredUser() {
  if (!canUseStorage()) return null;

  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export function getStoredUserRole(): Role | null {
  return getStoredUser()?.role ?? null;
}

export function storeAuthSession(token: string, user: {
  id: `${string}-${string}-${string}-${string}-${string}`;
  email: string;
  name: string
}) {
  if (!canUseStorage()) return;

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuthSession() {
  if (!canUseStorage()) return;

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
