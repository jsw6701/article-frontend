<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { auth, isLoggedIn, currentUser } from '$lib/stores/auth';

  onMount(() => {
    auth.init();
  });

  async function handleLogout() {
    await auth.logout();
  }
</script>

<div class="app">
  <header class="header">
    <a class="brand" href="/">경제 브리핑</a>
    <nav class="nav">
      <a class="nav-link" href="/">카드</a>
      <a class="nav-link" href="/today">오늘</a>
      <a class="nav-link" href="/trending">급상승</a>
      <span class="nav-divider"></span>
      {#if $isLoggedIn}
        <span class="user-name">{$currentUser?.username}</span>
        <button class="logout-btn" on:click={handleLogout}>로그아웃</button>
      {:else}
        <a class="nav-link auth-link" href="/login">로그인</a>
      {/if}
    </nav>
  </header>

  <main class="main">
    <slot />
  </main>
</div>

<style>
  .app {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-3);
    min-height: 100vh;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) 0;
    margin-bottom: var(--space-3);
  }

  .brand {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-main);
  }

  .nav {
    display: flex;
    gap: var(--space-3);
  }

  .nav-link {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-sub);
    transition: color 0.15s;
  }

  .nav-link:hover {
    color: var(--text-main);
  }

  .nav-divider {
    width: 1px;
    height: 14px;
    background: var(--border);
    margin: 0 var(--space-1);
  }

  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-main);
  }

  .logout-btn {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-sub);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }

  .logout-btn:hover {
    color: var(--text-main);
  }

  .auth-link {
    color: var(--accent);
    font-weight: 500;
  }

  .main {
    padding-bottom: var(--space-4);
  }
</style>
