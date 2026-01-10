import { writable, get } from 'svelte/store';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token, type PushNotificationSchema, type ActionPerformed } from '@capacitor/push-notifications';
import { goto } from '$app/navigation';
import { base } from '$app/paths';

// ========== Types ==========

export interface PushSettings {
  enabled: boolean;
  breakingNews: boolean;      // 속보 알림
  bookmarkUpdates: boolean;   // 북마크 이슈 업데이트
  dailyBriefing: boolean;     // 일일 브리핑 (매일 아침)
  trendingAlerts: boolean;    // 급상승 이슈 알림
}

export interface PushState {
  token: string | null;
  permissionGranted: boolean;
  settings: PushSettings;
  initialized: boolean;
  error: string | null;
}

// ========== Constants ==========

const PUSH_SETTINGS_KEY = 'push_settings';
const PUSH_TOKEN_KEY = 'push_token';

const DEFAULT_SETTINGS: PushSettings = {
  enabled: true,
  breakingNews: true,
  bookmarkUpdates: true,
  dailyBriefing: false,
  trendingAlerts: true,
};

// ========== Store ==========

function createPushStore() {
  const initialState: PushState = {
    token: null,
    permissionGranted: false,
    settings: DEFAULT_SETTINGS,
    initialized: false,
    error: null,
  };

  const { subscribe, set, update } = writable<PushState>(initialState);

  // 로컬 스토리지에서 설정 로드
  function loadSettings(): PushSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
      const stored = localStorage.getItem(PUSH_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  }

  // 로컬 스토리지에 설정 저장
  function saveSettings(settings: PushSettings) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PUSH_SETTINGS_KEY, JSON.stringify(settings));
  }

  // 토큰 저장
  function saveToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PUSH_TOKEN_KEY, token);
  }

  // 토큰 로드
  function loadToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(PUSH_TOKEN_KEY);
  }

  return {
    subscribe,

    // 푸시 알림 초기화
    async init() {
      // 네이티브 플랫폼이 아니면 스킵
      if (!Capacitor.isNativePlatform()) {
        update(s => ({ ...s, initialized: true }));
        return;
      }

      // 저장된 설정 로드
      const savedSettings = loadSettings();
      const savedToken = loadToken();

      update(s => ({
        ...s,
        settings: savedSettings,
        token: savedToken,
      }));

      // 권한 체크
      const permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'granted') {
        update(s => ({ ...s, permissionGranted: true }));
        await this.register();
      }

      // 리스너 등록
      this.setupListeners();

      update(s => ({ ...s, initialized: true }));
    },

    // 리스너 설정
    setupListeners() {
      // 등록 성공
      PushNotifications.addListener('registration', async (token: Token) => {
        console.log('[Push] Registration token:', token.value);
        saveToken(token.value);
        update(s => ({ ...s, token: token.value, error: null }));

        // 서버에 토큰 등록 (API 호출)
        try {
          const { registerPushToken } = await import('$lib/api');
          await registerPushToken(token.value);
        } catch (e) {
          console.error('[Push] Failed to register token to server:', e);
        }
      });

      // 등록 실패
      PushNotifications.addListener('registrationError', (error) => {
        console.error('[Push] Registration error:', error);
        update(s => ({ ...s, error: '푸시 알림 등록에 실패했습니다.' }));
      });

      // 포그라운드에서 알림 수신
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('[Push] Notification received:', notification);
        // 포그라운드에서는 기본적으로 알림이 표시되지 않음
        // 필요시 인앱 알림 표시 가능
      });

      // 알림 클릭 시 (백그라운드/종료 상태에서)
      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('[Push] Action performed:', action);
        const data = action.notification.data;

        // 알림 데이터에 따라 적절한 페이지로 이동
        if (data?.issueId) {
          goto(`${base}/cards/${data.issueId}`);
        } else if (data?.route) {
          goto(`${base}${data.route}`);
        }
      });
    },

    // 권한 요청 및 등록
    async requestPermission(): Promise<boolean> {
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === 'granted') {
          update(s => ({ ...s, permissionGranted: true }));
          await this.register();
          return true;
        }

        update(s => ({ ...s, permissionGranted: false }));
        return false;
      } catch (e) {
        console.error('[Push] Permission request error:', e);
        update(s => ({ ...s, error: '권한 요청 중 오류가 발생했습니다.' }));
        return false;
      }
    },

    // 푸시 알림 등록
    async register() {
      if (!Capacitor.isNativePlatform()) return;

      try {
        await PushNotifications.register();
      } catch (e) {
        console.error('[Push] Registration error:', e);
        update(s => ({ ...s, error: '푸시 알림 등록에 실패했습니다.' }));
      }
    },

    // 푸시 알림 해제 (토큰 삭제)
    async unregister() {
      if (!Capacitor.isNativePlatform()) return;

      const state = get({ subscribe });
      if (state.token) {
        try {
          const { unregisterPushToken } = await import('$lib/api');
          await unregisterPushToken(state.token);
        } catch (e) {
          console.error('[Push] Failed to unregister token from server:', e);
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem(PUSH_TOKEN_KEY);
      }

      update(s => ({ ...s, token: null }));
    },

    // 설정 업데이트
    async updateSettings(newSettings: Partial<PushSettings>) {
      update(s => {
        const updated = { ...s.settings, ...newSettings };
        saveSettings(updated);
        return { ...s, settings: updated };
      });

      // 서버에 설정 동기화
      const state = get({ subscribe });
      try {
        const { updatePushSettings } = await import('$lib/api');
        await updatePushSettings(state.settings);
      } catch (e) {
        console.error('[Push] Failed to sync settings:', e);
      }
    },

    // 전체 알림 활성화/비활성화
    async setEnabled(enabled: boolean) {
      if (enabled) {
        const granted = await this.requestPermission();
        if (!granted) {
          return false;
        }
      } else {
        await this.unregister();
      }

      await this.updateSettings({ enabled });
      return true;
    },

    // 개별 알림 설정
    setBreakingNews(value: boolean) {
      this.updateSettings({ breakingNews: value });
    },

    setBookmarkUpdates(value: boolean) {
      this.updateSettings({ bookmarkUpdates: value });
    },

    setDailyBriefing(value: boolean) {
      this.updateSettings({ dailyBriefing: value });
    },

    setTrendingAlerts(value: boolean) {
      this.updateSettings({ trendingAlerts: value });
    },

    // 현재 설정 가져오기
    getSettings(): PushSettings {
      return get({ subscribe }).settings;
    },

    // 토큰 가져오기
    getToken(): string | null {
      return get({ subscribe }).token;
    },
  };
}

export const pushNotification = createPushStore();

// Derived stores
export const isPushEnabled = {
  subscribe: (fn: (value: boolean) => void) => {
    return pushNotification.subscribe(state => fn(state.settings.enabled && state.permissionGranted));
  }
};

export const pushSettings = {
  subscribe: (fn: (value: PushSettings) => void) => {
    return pushNotification.subscribe(state => fn(state.settings));
  }
};
