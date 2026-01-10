import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// 온라인 상태 스토어
function createNetworkStore() {
  const { subscribe, set } = writable(browser ? navigator.onLine : true);

  if (browser) {
    window.addEventListener('online', () => set(true));
    window.addEventListener('offline', () => set(false));
  }

  return {
    subscribe
  };
}

export const isOnline = createNetworkStore();

// 오프라인 배너 표시 여부 (사용자가 닫을 수 있음)
function createOfflineBannerStore() {
  const { subscribe, set, update } = writable({
    dismissed: false,
    lastDismissed: 0
  });

  return {
    subscribe,
    dismiss: () => {
      update(state => ({
        ...state,
        dismissed: true,
        lastDismissed: Date.now()
      }));
    },
    reset: () => {
      update(state => ({
        ...state,
        dismissed: false
      }));
    }
  };
}

export const offlineBanner = createOfflineBannerStore();

// 배너 표시 여부 (오프라인 + 아직 닫지 않음)
export const showOfflineBanner = derived(
  [isOnline, offlineBanner],
  ([$isOnline, $offlineBanner]) => {
    // 온라인으로 돌아오면 dismissed 상태 리셋
    if ($isOnline && $offlineBanner.dismissed) {
      // 10초 후에 리셋 (너무 빨리 깜빡이지 않도록)
      setTimeout(() => offlineBanner.reset(), 10000);
    }
    return !$isOnline && !$offlineBanner.dismissed;
  }
);
