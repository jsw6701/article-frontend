import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { isLoggedIn } from './auth';
import { getUserSettings, updateUserSettings } from '$lib/api';

// 설정 타입 정의
export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type StartPage = 'home' | 'feed' | 'trending';

export interface UserSettings {
  theme: Theme;
  fontSize: FontSize;
  startPage: StartPage;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  fontSize: 'medium',
  startPage: 'home'
};

const STORAGE_KEY = 'user_settings';

// 로컬 스토리지에서 설정 불러오기
function getLocalSettings(): UserSettings {
  if (!browser) return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to parse settings:', e);
  }
  return DEFAULT_SETTINGS;
}

// 로컬 스토리지에 설정 저장
function saveLocalSettings(settings: UserSettings) {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// 설정 적용
function applySettings(settings: UserSettings) {
  if (!browser) return;

  // 테마 적용
  document.documentElement.setAttribute('data-theme', settings.theme);

  // 글꼴 크기 적용
  document.documentElement.setAttribute('data-font-size', settings.fontSize);
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<UserSettings>(getLocalSettings());

  let syncTimeout: ReturnType<typeof setTimeout> | null = null;

  // 서버와 동기화 (디바운스)
  async function syncToServer(settings: UserSettings) {
    if (!get(isLoggedIn)) return;

    if (syncTimeout) clearTimeout(syncTimeout);

    syncTimeout = setTimeout(async () => {
      try {
        await updateUserSettings(settings);
      } catch (e) {
        console.error('Failed to sync settings to server:', e);
      }
    }, 1000); // 1초 디바운스
  }

  return {
    subscribe,

    // 초기화 (앱 시작 시 호출)
    init: async () => {
      let settings = getLocalSettings();

      // 로그인 상태면 서버에서 설정 불러오기
      if (browser && get(isLoggedIn)) {
        try {
          const serverSettings = await getUserSettings();
          if (serverSettings) {
            settings = { ...DEFAULT_SETTINGS, ...serverSettings };
            saveLocalSettings(settings);
          }
        } catch (e) {
          console.error('Failed to fetch settings from server:', e);
        }
      }

      applySettings(settings);
      set(settings);
    },

    // 테마 변경
    setTheme: (theme: Theme) => {
      update(current => {
        const next = { ...current, theme };
        saveLocalSettings(next);
        applySettings(next);
        syncToServer(next);
        return next;
      });
    },

    // 테마 토글
    toggleTheme: () => {
      update(current => {
        const theme = current.theme === 'dark' ? 'light' : 'dark';
        const next = { ...current, theme };
        saveLocalSettings(next);
        applySettings(next);
        syncToServer(next);
        return next;
      });
    },

    // 글꼴 크기 변경
    setFontSize: (fontSize: FontSize) => {
      update(current => {
        const next = { ...current, fontSize };
        saveLocalSettings(next);
        applySettings(next);
        syncToServer(next);
        return next;
      });
    },

    // 시작 페이지 변경
    setStartPage: (startPage: StartPage) => {
      update(current => {
        const next = { ...current, startPage };
        saveLocalSettings(next);
        syncToServer(next);
        return next;
      });
    },

    // 전체 설정 업데이트
    update: (newSettings: Partial<UserSettings>) => {
      update(current => {
        const next = { ...current, ...newSettings };
        saveLocalSettings(next);
        applySettings(next);
        syncToServer(next);
        return next;
      });
    },

    // 설정 초기화
    reset: () => {
      saveLocalSettings(DEFAULT_SETTINGS);
      applySettings(DEFAULT_SETTINGS);
      set(DEFAULT_SETTINGS);
      syncToServer(DEFAULT_SETTINGS);
    }
  };
}

export const settings = createSettingsStore();

// 개별 설정값 derived stores
export const currentTheme = derived(settings, $s => $s.theme);
export const currentFontSize = derived(settings, $s => $s.fontSize);
export const currentStartPage = derived(settings, $s => $s.startPage);
