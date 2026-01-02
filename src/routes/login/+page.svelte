<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { auth, isLoggedIn } from "$lib/stores/auth";
  import { settings, currentStartPage } from "$lib/stores/settings";
  import ShiftLogo from "$lib/components/ShiftLogo.svelte";

  let username = "";
  let password = "";
  let error = "";
  let loading = false;

  // 시작 페이지 경로 매핑
  const startPagePaths: Record<string, string> = {
    home: '/',
    feed: '/today',
    trending: '/trending'
  };

  // 이미 로그인된 경우 시작 페이지로 리다이렉트
  onMount(() => {
    auth.init();
  });

  $: if ($isLoggedIn) {
    navigateToStartPage();
  }

  async function navigateToStartPage() {
    // 서버에서 설정을 불러온 후 시작 페이지로 이동
    await settings.init();
    const startPage = get(currentStartPage);
    const targetPath = startPagePaths[startPage] || '/';
    goto(`${base}${targetPath}`);
  }

  async function handleSubmit() {
    error = "";

    if (!username.trim()) {
      error = "아이디를 입력해주세요.";
      return;
    }
    if (!password) {
      error = "비밀번호를 입력해주세요.";
      return;
    }

    loading = true;
    const result = await auth.login(username, password);
    loading = false;

    if (result.success) {
      // 로그인 성공 시 설정 불러오고 시작 페이지로 이동
      await navigateToStartPage();
    } else {
      error = result.message;
    }
  }
</script>

<svelte:head>
  <title>로그인 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="header">
    <ShiftLogo size="lg" />
    <p class="subtitle">계정에 로그인하세요</p>
  </header>

  <form class="form" on:submit|preventDefault={handleSubmit}>
    <div class="field">
      <label for="username">아이디</label>
      <input
        type="text"
        id="username"
        bind:value={username}
        placeholder="아이디 입력"
        autocomplete="username"
      />
    </div>

    <div class="field">
      <label for="password">비밀번호</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        placeholder="비밀번호 입력"
        autocomplete="current-password"
      />
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <button type="submit" class="submit" disabled={loading}>
      {loading ? "로그인 중..." : "로그인"}
    </button>
  </form>

  <div class="footer">
    <span>계정이 없으신가요?</span>
    <a href="{base}/signup">회원가입</a>
  </div>
</div>

<style>
  .page {
    max-width: 380px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding-top: var(--space-5);
  }

  .header {
    text-align: center;
    padding: var(--space-5) 0;
  }

  .subtitle {
    font-size: 17px;
    color: var(--text-secondary);
    margin: var(--space-3) 0 0;
  }

  .form {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .field label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    padding-left: var(--space-1);
  }

  .field input {
    padding: var(--space-4);
    font-size: 17px;
    color: var(--text-primary);
    background: var(--bg-secondary);
    border: none;
    border-radius: var(--radius);
    transition: box-shadow var(--duration-fast) var(--ease);
  }

  .field input::placeholder {
    color: var(--text-tertiary);
  }

  .field input:focus {
    outline: none;
    box-shadow: 0 0 0 4px var(--accent-glow);
  }

  .error {
    font-size: 15px;
    color: var(--system-red);
    padding: var(--space-4);
    background: rgba(255, 59, 48, 0.1);
    border-radius: var(--radius);
    text-align: center;
    line-height: 1.5;
  }

  .submit {
    padding: var(--space-4);
    font-size: 17px;
    font-weight: 600;
    color: white;
    background: var(--accent);
    border-radius: var(--radius);
    transition: opacity var(--duration-fast) var(--ease);
    margin-top: var(--space-2);
  }

  .submit:disabled {
    opacity: 0.5;
  }

  .submit:not(:disabled):active {
    opacity: 0.8;
  }

  .footer {
    text-align: center;
    font-size: 16px;
    color: var(--text-secondary);
  }

  .footer a {
    color: var(--accent);
    font-weight: 600;
    margin-left: var(--space-2);
  }
</style>
