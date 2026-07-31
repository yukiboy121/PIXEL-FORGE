export interface LocalUser {
  email: string;
  name: string;
  passwordHash?: string;
  provider: "password" | "google";
}

const USERS_KEY = "pixelforge-users";
const SESSION_KEY = "pixelforge-session";

function getUsers(): LocalUser[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as LocalUser[];
}

async function hash(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setSession(user: LocalUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): LocalUser | null {
  const value = localStorage.getItem(SESSION_KEY);
  return value ? (JSON.parse(value) as LocalUser) : null;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export async function register(name: string, email: string, password: string): Promise<LocalUser> {
  const normalizedEmail = email.trim().toLowerCase();
  if (getUsers().some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with this email already exists on this browser.");
  }
  const user: LocalUser = { name: name.trim(), email: normalizedEmail, passwordHash: await hash(password), provider: "password" };
  localStorage.setItem(USERS_KEY, JSON.stringify([...getUsers(), user]));
  setSession(user);
  return user;
}

export async function signIn(email: string, password: string): Promise<LocalUser> {
  const user = getUsers().find((item) => item.email === email.trim().toLowerCase());
  if (!user || user.passwordHash !== await hash(password)) throw new Error("Incorrect email or password.");
  setSession(user);
  return user;
}

export function signInWithGoogle(name: string, email: string): LocalUser {
  const normalizedEmail = email.toLowerCase();
  const users = getUsers();
  const user = users.find((item) => item.email === normalizedEmail) ?? { name, email: normalizedEmail, provider: "google" as const };
  if (!users.some((item) => item.email === normalizedEmail)) localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  setSession(user);
  return user;
}
