<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { auth, isLoggedIn, currentUser } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';

  onMount(() => {
    auth.init();
    theme.init();
  });

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
</script>

<div class="app">
  <!-- 상단 상태바 -->
  <header class="status-bar">
    <div class="status-left">
      <span class="live-dot"></span>
      <span class="live-text">LIVE</span>
    </div>
    <div class="status-center">
      <span class="time">{hours}:{minutes}</span>
    </div>
    <div class="status-right">
      <button class="theme-btn" on:click={() => theme.toggle()} aria-label="테마 전환">
        {#if $theme === 'dark'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        {/if}
      </button>
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

  <!-- 하단 네비게이션 -->
  <nav class="bottom-nav">
    <a
      class="nav-item"
      class:active={isActive('/')}
      href="{base}/"
    >
      <div class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </div>
      <span class="nav-label">Dashboard</span>
    </a>
    <a
      class="nav-item"
      class:active={isActive('/today')}
      href="{base}/today"
    >
      <div class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="10" y1="9" x2="8" y2="9"/>
        </svg>
      </div>
      <span class="nav-label">Feed</span>
    </a>
    <a
      class="nav-item"
      class:active={isActive('/trending')}
      href="{base}/trending"
    >
      <div class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
          <polyline points="17,6 23,6 23,12"/>
        </svg>
      </div>
      <span class="nav-label">Trending</span>
    </a>
    {#if $isLoggedIn}
      <a
        class="nav-item"
        class:active={isActive('/bookmarks')}
        href="{base}/bookmarks"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span class="nav-label">Saved</span>
      </a>
    {/if}
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
  }

  .status-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .time {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-body);
    font-variant-numeric: tabular-nums;
  }

  .status-right {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .user-name {
    font-size: 12px;
    color: var(--text-sub);
  }

  .theme-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-sub);
    border-radius: var(--radius);
    transition: all 0.2s var(--ease);
  }

  .theme-btn:hover {
    color: var(--text-main);
    background: var(--card);
  }

  .theme-btn svg {
    width: 18px;
    height: 18px;
  }

  .logout-btn,
  .login-btn {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-sub);
    padding: 4px 8px;
    border-radius: var(--radius);
    transition: all 0.2s var(--ease);
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

  /* 하단 네비게이션 */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: space-around;
    padding: var(--space-2) var(--space-4);
    padding-bottom: calc(var(--space-2) + env(safe-area-inset-bottom, 0px));
    background: var(--bg-surface);
    border-top: 1px solid var(--border);
    backdrop-filter: blur(10px);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-lg);
    transition: all 0.2s var(--ease);
  }

  .nav-item:hover {
    background: var(--card);
  }

  .nav-item.active {
    background: var(--card);
  }

  .nav-item.active .nav-icon {
    color: var(--accent);
  }

  .nav-item.active .nav-label {
    color: var(--accent);
  }

  .nav-icon {
    width: 24px;
    height: 24px;
    color: var(--text-sub);
    transition: color 0.2s var(--ease);
  }

  .nav-icon svg {
    width: 100%;
    height: 100%;
  }

  .nav-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-sub);
    transition: color 0.2s var(--ease);
  }

  @media (max-width: 480px) {
    .status-bar {
      padding: var(--space-2) var(--space-3);
    }

    .main {
      padding: var(--space-3);
      padding-bottom: 100px;
    }
  }
</style>
