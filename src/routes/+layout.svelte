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
  const publicPaths = ['/login', '/signup', '/privacy', '/terms'];

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

    // 로그인 상태이고 홈('/')에서 시작했을 때만 시작 페이지로 리다이렉트
    const currentPath = window.location.pathname.replace(base, '') || '/';
    if (get(isLoggedIn) && currentPath === '/' && !initialRedirectDone) {
      const startPage = get(currentStartPage);
      const targetPath = startPagePaths[startPage] || '/';
      if (targetPath !== '/') {
        initialRedirectDone = true;
        goto(`${base}${targetPath}`, { replaceState: true });
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

  // 현재 시간
  let time = new Date();
  onMount(() => {
    const interval = setInterval(() => {
      time = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  $: hours = time.getHours().toString().padStart(2, '0');
  $: minutes = time.getMinutes().toString().padStart(2, '0');

  // 메뉴 항목 정의
  type NavItem = {
    path: string;
    label: string;
    icon: string;
    show: 'always' | 'logged-in' | 'admin';
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: 'home', show: 'always' },
    { path: '/today', label: 'Feed', icon: 'feed', show: 'always' },
    { path: '/trending', label: 'Trend', icon: 'trend', show: 'always' },
    { path: '/bookmarks', label: 'Saved', icon: 'bookmark', show: 'logged-in' },
    { path: '/mypage', label: 'My', icon: 'user', show: 'logged-in' },
    { path: '/admin', label: 'Admin', icon: 'admin', show: 'admin' },
  ];

  $: visibleItems = navItems.filter(item => {
    if (item.show === 'always') return true;
    if (item.show === 'logged-in') return $isLoggedIn;
    if (item.show === 'admin') return $isAdmin;
    return false;
  });

</script>

<div class="app">
  <!-- 상단 상태바 -->
  <header class="status-bar">
    <div class="status-left">
      <span class="live-dot"></span>
      <span class="live-text">LIVE</span>
      <span class="time">{hours}:{minutes}</span>
    </div>
    <a class="status-center" href="{base}/">
      <ShiftLogo size="sm" />
    </a>
    <div class="status-right">
      {#if $isLoggedIn}
        <span class="user-name">{$currentUser?.username}</span>
        <button class="logout-btn" on:click={handleLogout}>logout</button>
      {:else}
        <a class="login-btn" href="{base}/login">login</a>
      {/if}
    </div>
  </header>

  <!-- 메인 컨텐츠 -->
  <main class="main">
    <slot />
  </main>

  <!-- 하단 Liquid Glass 네비게이션 -->
  <nav class="bottom-nav-wrapper">
    <div class="bottom-nav">
      {#each visibleItems as item (item.path)}
        <a
          class="nav-item"
          class:active={isActive(item.path)}
          href="{base}{item.path === '/' ? '/' : item.path}"
        >
          <div class="nav-icon">
            {#if item.icon === 'home'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            {:else if item.icon === 'feed'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            {:else if item.icon === 'trend'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            {:else if item.icon === 'bookmark'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            {:else if item.icon === 'user'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            {:else if item.icon === 'admin'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            {/if}
          </div>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    /* 글꼴 크기 설정에 따른 UI 스케일 조절 */
    zoom: var(--ui-scale, 1);
  }

  /* Firefox 126 이전 버전 폴백 (transform 사용) */
  @supports not (zoom: 1) {
    .app {
      transform: scale(var(--ui-scale, 1));
      transform-origin: top center;
    }
  }

  /* 상단 상태바 */
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .status-left {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .live-dot {
    width: 8px;
    height: 8px;
    background: var(--accent-green);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
    50% { opacity: 0.8; box-shadow: 0 0 0 4px transparent; }
  }

  .live-text {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent-green);
    letter-spacing: 0.1em;
    line-height: 1;
  }

  .status-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .time {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-sub);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    margin-left: var(--space-1);
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .user-name {
    font-size: 12px;
    color: var(--text-sub);
    line-height: 1;
  }

  .logout-btn,
  .login-btn {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-sub);
    padding: 4px 8px;
    border-radius: var(--radius);
    transition: all 0.2s var(--ease);
    line-height: 1;
  }

  .logout-btn:hover,
  .login-btn:hover {
    color: var(--text-main);
    background: var(--card);
  }

  /* 메인 */
  .main {
    flex: 1;
    padding: var(--space-4);
    padding-bottom: 100px;
  }

  /* 하단 Liquid Glass 네비게이션 */
  .bottom-nav-wrapper {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    z-index: 100;
  }

  .bottom-nav {
    position: relative;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 8px 6px;
    border-radius: 24px;
    /* Liquid Glass 효과 */
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.08) 100%
    );
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    /* Glass 테두리 */
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  }

  /* 라이트 테마 Glass - Apple 스타일 */
  :global([data-theme="light"]) .bottom-nav {
    /* 약간의 웜 그레이 틴트 + 반투명 */
    background: linear-gradient(
      135deg,
      rgba(250, 249, 247, 0.72) 0%,
      rgba(245, 244, 241, 0.65) 50%,
      rgba(250, 249, 247, 0.72) 100%
    );
    backdrop-filter: blur(40px) saturate(180%) brightness(1.05);
    -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(1.05);
    /* 테두리 - 미세한 다크 라인 + 화이트 하이라이트 */
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow:
      /* 외부 그림자 - 떠있는 느낌 */
      0 2px 8px rgba(0, 0, 0, 0.04),
      0 8px 24px rgba(0, 0, 0, 0.08),
      /* 내부 하이라이트 - 상단 밝게 */
      inset 0 1px 1px rgba(255, 255, 255, 0.9),
      inset 0 -1px 1px rgba(0, 0, 0, 0.03);
  }

  .nav-item {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 14px;
    min-width: 50px;
    border-radius: 14px;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .nav-item:hover .nav-icon {
    transform: scale(1.1) translateY(-1px);
    color: var(--text-body);
  }

  .nav-item:active {
    transform: scale(0.95);
  }

  /* 활성 아이콘 - 섬세한 디자인 */
  .nav-item.active .nav-icon {
    color: var(--accent);
    transform: scale(1.08);
    filter: drop-shadow(0 0 8px var(--accent-glow));
  }

  .nav-item.active .nav-icon svg {
    stroke: var(--accent);
    stroke-width: 2;
  }

  .nav-item.active .nav-label {
    color: var(--accent);
    font-weight: 600;
  }

  .nav-icon {
    width: 24px;
    height: 24px;
    color: var(--text-sub);
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .nav-icon svg {
    width: 100%;
    height: 100%;
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .nav-label {
    font-size: 10px;
    font-weight: 500;
    color: var(--text-sub);
    transition: all 0.35s var(--ease);
    white-space: nowrap;
    letter-spacing: 0.02em;
  }

  @media (max-width: 480px) {
    .status-bar {
      padding: var(--space-2) var(--space-3);
    }

    .main {
      padding: var(--space-3);
      padding-bottom: 110px;
    }

    .bottom-nav-wrapper {
      padding: 10px 12px;
      padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    }

    .bottom-nav {
      padding: 6px 4px;
      border-radius: 20px;
    }

    .nav-item {
      padding: 6px 10px;
      min-width: 44px;
      gap: 3px;
    }

    .nav-icon {
      width: 22px;
      height: 22px;
    }

    .nav-label {
      font-size: 9px;
    }
  }
</style>
