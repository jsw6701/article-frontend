import { writable, derived } from "svelte/store";
import type { AuthUser } from "../types";
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefresh } from "../api";

const STORAGE_KEY = "auth_user";

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

function createAuthStore() {
  // 초기값을 localStorage에서 바로 가져옴 (SSR에서는 null)
  const initialUser = typeof window !== "undefined" ? getStoredUser() : null;
  const { subscribe, set, update } = writable<AuthUser | null>(initialUser);

  return {
    subscribe,

    init() {
      // 클라이언트에서 다시 한번 확인
      const stored = getStoredUser();
      set(stored);
    },

    async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
      try {
        const res = await apiLogin({ username, password });
        if (res.success && res.accessToken && res.refreshToken && res.userId && res.username && res.role) {
          const user: AuthUser = {
            userId: res.userId,
            username: res.username,
            role: res.role,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
          set(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return { success: true, message: "로그인 성공" };
        }
        return { success: false, message: res.message ?? "로그인 실패" };
      } catch (e) {
        return { success: false, message: "서버 오류가 발생했습니다." };
      }
    },

    async logout(): Promise<void> {
      const stored = getStoredUser();
      if (stored) {
        try {
          await apiLogout(stored.userId);
        } catch {
          // ignore
        }
      }
      set(null);
      localStorage.removeItem(STORAGE_KEY);
    },

    clear() {
      set(null);
      localStorage.removeItem(STORAGE_KEY);
    },

    async refresh(): Promise<boolean> {
      const stored = getStoredUser();
      if (!stored) return false;

      try {
        const res = await apiRefresh(stored.refreshToken);
        if (res.success && res.accessToken && res.refreshToken) {
          const user: AuthUser = {
            ...stored,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
          set(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return true;
        }
        // refresh 실패 시 로그아웃
        set(null);
        localStorage.removeItem(STORAGE_KEY);
        return false;
      } catch {
        set(null);
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
    },

    getAccessToken(): string | null {
      const stored = getStoredUser();
      return stored?.accessToken ?? null;
    },
  };
}

export const auth = createAuthStore();
export const isLoggedIn = derived(auth, ($auth) => $auth !== null);
export const currentUser = derived(auth, ($auth) => $auth);
export const isAdmin = derived(auth, ($auth) => $auth?.role === "ADMIN");
