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

<div class="page">
  <header class="page-header">
    <ShiftLogo size="lg" />
    <p>계정에 로그인하세요</p>
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
    max-width: 360px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .page-header {
    padding: var(--space-4) 0 var(--space-2);
    text-align: center;
  }


  .page-header p {
    font-size: 13px;
    color: var(--text-sub);
    margin: 0;
  }

  .form {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-body);
  }

  .field input {
    padding: var(--space-3);
    font-size: 15px;
    color: var(--text-main);
    background: var(--card-hover);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: border-color 0.15s;
  }

  .field input::placeholder {
    color: var(--text-sub);
  }

  .field input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .error {
    font-size: 13px;
    color: var(--accent-red);
    padding: var(--space-3);
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius);
  }

  .submit {
    padding: var(--space-3);
    font-size: 15px;
    font-weight: 600;
    color: white;
    background: var(--accent);
    border-radius: var(--radius);
    transition: opacity 0.15s;
  }

  .submit:disabled {
    opacity: 0.6;
  }

  .footer {
    text-align: center;
    font-size: 13px;
    color: var(--text-sub);
  }

  .footer a {
    color: var(--accent);
    font-weight: 500;
    margin-left: var(--space-1);
  }
</style>
