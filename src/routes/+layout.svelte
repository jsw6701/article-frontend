<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { auth, isLoggedIn, currentUser, isAdmin } from '$lib/stores/auth';
  import { settings, currentStartPage } from '$lib/stores/settings';
  import ShiftLogo from '$lib/components/ShiftLogo.svelte';

  // 인증 불필요한 페이지
  const publicPaths = ['/login', '/signup', '/privacy', '/terms', '/forgot-password', '/find-username'];

  let mounted = false;
  let initialRedirectDone = false;

  // 시작 페이지 경로 매핑
  const startPagePaths: Record<string, string> = {
    home: '/',
    feed: '/today',
    trending: '/trending'
  };

  onMount(async () => {
    auth.init();
    await settings.init();
    mounted = true;

    // 저장된 인증 정보가 있으면 토큰 갱신 시도 (자동 로그인)
    const currentPath = window.location.pathname.replace(base, '') || '/';
    const isPublicPage = publicPaths.some(p => currentPath.startsWith(p));

    if (get(isLoggedIn)) {
      // 앱 시작 시 토큰 갱신 시도
      const refreshed = await auth.refresh();
      if (!refreshed && !isPublicPage) {
        // 토큰 갱신 실패 시 로그인 페이지로 이동
        auth.clear();
        goto(`${base}/login`);
        return;
      }

      // 로그인 상태이고 홈('/')에서 시작했을 때만 시작 페이지로 리다이렉트
      if (currentPath === '/' && !initialRedirectDone) {
        const startPage = get(currentStartPage);
        const targetPath = startPagePaths[startPage] || '/';
        if (targetPath !== '/') {
          initialRedirectDone = true;
          goto(`${base}${targetPath}`, { replaceState: true });
        }
      }
    }

    // 401 에러 시 로그인 페이지로 이동
    const handleAuthExpired = () => {
      auth.clear();
      goto(`${base}/login`);
    };
    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  });

  // 인증 체크 및 리다이렉트 - mounted 후에만 실행
  function checkAuth(loggedIn: boolean, path: string) {
    if (!mounted) return;

    const normalizedPath = path.replace(base, '') || '/';
    const isPublicPage = publicPaths.some(p => normalizedPath.startsWith(p));

    if (!loggedIn && !isPublicPage) {
      goto(`${base}/login`);
    }
  }

  $: if (mounted) {
    checkAuth($isLoggedIn, $page.url.pathname);
  }

  async function handleLogout() {
    await auth.logout();
  }

  $: currentPath = $page.url.pathname;

  function isActive(path: string): boolean {
    if (path === '/') {
      return currentPath === '/' || currentPath === base + '/';
    }
    return currentPath.includes(path);
  }

  // 메뉴 항목 정의
  type NavItem = {
    path: string;
    label: string;
    icon: string;
    show: 'always' | 'logged-in' | 'admin';
  };

  const navItems: NavItem[] = [
    { path: '/', label: '홈', icon: 'home', show: 'always' },
    { path: '/today', label: '피드', icon: 'feed', show: 'always' },
    { path: '/trending', label: '트렌드', icon: 'trend', show: 'always' },
    { path: '/bookmarks', label: '저장', icon: 'bookmark', show: 'logged-in' },
    { path: '/mypage', label: 'MY', icon: 'user', show: 'logged-in' },
    { path: '/admin', label: '관리', icon: 'admin', show: 'admin' },
  ];

  $: visibleItems = navItems.filter(item => {
    if (item.show === 'always') return true;
    if (item.show === 'logged-in') return $isLoggedIn;
    if (item.show === 'admin') return $isAdmin;
    return false;
  });

</script>

<div class="app">
  <!-- 메인 컨텐츠 -->
  <main class="main">
    <slot />
  </main>

  <!-- 하단 탭바 - iOS 스타일 -->
  <nav class="tab-bar">
    {#each visibleItems as item (item.path)}
      <a
        class="tab-item"
        class:active={isActive(item.path)}
        href="{base}{item.path === '/' ? '/' : item.path}"
      >
        <div class="tab-icon">
          {#if item.icon === 'home'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6a1 1 0 00-1-1h-4a1 1 0 00-1 1v6H4a1 1 0 01-1-1V9.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
          {:else if item.icon === 'feed'}
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/>
              <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          {:else if item.icon === 'trend'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 7h4v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else if item.icon === 'bookmark'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
          {:else if item.icon === 'user'}
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          {:else if item.icon === 'admin'}
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.8"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          {/if}
        </div>
        <span class="tab-label">{item.label}</span>
      </a>
    {/each}
  </nav>
</div>

<style>
  .app {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    background: var(--bg);
    zoom: var(--ui-scale, 1);
  }

  @supports not (zoom: 1) {
    .app {
      transform: scale(var(--ui-scale, 1));
      transform-origin: top center;
    }
  }

  /* 메인 */
  .main {
    flex: 1;
    padding: var(--space-4);
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }

  /* 탭바 - iOS 스타일 */
  .tab-bar {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    padding: var(--space-2) var(--space-3);
    padding-bottom: calc(var(--space-2) + env(safe-area-inset-bottom, 0px));
    background: var(--glass-bg);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 0.5px solid var(--glass-border);
    z-index: 100;
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--space-1) var(--space-2);
    min-width: 56px;
    border-radius: var(--radius);
    transition: all var(--duration) var(--ease);
    -webkit-tap-highlight-color: transparent;
  }

  .tab-item:active {
    transform: scale(0.92);
    opacity: 0.7;
  }

  .tab-icon {
    width: 26px;
    height: 26px;
    color: var(--text-tertiary);
    transition: all var(--duration) var(--ease);
  }

  .tab-icon svg {
    width: 100%;
    height: 100%;
  }

  .tab-label {
    font-size: 10px;
    font-weight: 500;
    color: var(--text-tertiary);
    transition: all var(--duration) var(--ease);
    white-space: nowrap;
  }

  /* 활성 탭 */
  .tab-item.active .tab-icon {
    color: var(--accent);
  }

  .tab-item.active .tab-icon svg {
    stroke-width: 2.2;
  }

  .tab-item.active .tab-label {
    color: var(--accent);
    font-weight: 600;
  }

  @media (max-width: 480px) {
    .main {
      padding: var(--space-3);
      padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
    }

    .tab-bar {
      padding: var(--space-1) var(--space-2);
      padding-bottom: calc(var(--space-1) + env(safe-area-inset-bottom, 0px));
    }

    .tab-item {
      min-width: 48px;
      padding: var(--space-1);
    }

    .tab-icon {
      width: 24px;
      height: 24px;
    }

    .tab-label {
      font-size: 9px;
    }
  }
</style>
