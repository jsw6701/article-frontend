import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function createThemeStore() {
  const defaultTheme: Theme = 'dark';

  // 브라우저에서만 localStorage 접근
  const stored = browser ? localStorage.getItem('theme') as Theme : null;
  const initial = stored || defaultTheme;

  const { subscribe, set, update } = writable<Theme>(initial);

  return {
    subscribe,
    set: (value: Theme) => {
      if (browser) {
        localStorage.setItem('theme', value);
        document.documentElement.setAttribute('data-theme', value);
      }
      set(value);
    },
    toggle: () => {
      update(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        if (browser) {
          localStorage.setItem('theme', next);
          document.documentElement.setAttribute('data-theme', next);
        }
        return next;
      });
    },
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('theme') as Theme;
        const theme = stored || defaultTheme;
        document.documentElement.setAttribute('data-theme', theme);
        set(theme);
      }
    }
  };
}

export const theme = createThemeStore();
