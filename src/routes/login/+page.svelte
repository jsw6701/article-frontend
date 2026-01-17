<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { auth, isLoggedIn, currentUser } from "$lib/stores/auth";
  import { settings, currentStartPage } from "$lib/stores/settings";
  import { pushNotification } from "$lib/stores/pushNotification";
  import ShiftLogo from "$lib/components/ShiftLogo.svelte";
  import TermsAgreementModal from "$lib/components/TermsAgreementModal.svelte";

  let username = "";
  let password = "";
  let rememberMe = false;
  let error = "";
  let loading = false;
  let showTermsModal = false;
  let pendingUserId: number | null = null;
  let loginInProgress = false; // 로그인 처리 중 플래그

  // 시작 페이지 경로 매핑
  const startPagePaths: Record<string, string> = {
    home: '/',
    feed: '/today',
    trending: '/trending'
  };

  // 이미 로그인된 경우 시작 페이지로 리다이렉트
  onMount(() => {
    // auth.init()은 +layout.svelte에서 이미 호출됨
    // 이미 로그인된 상태로 페이지 진입 시에만 리다이렉트
    if ($isLoggedIn) {
      navigateToStartPage();
    }
  });

  async function navigateToStartPage() {
    // 서버에서 설정을 불러온 후 시작 페이지로 이동
    await settings.init();

    // 푸시 알림 초기화 (로그인 직후 실행)
    await pushNotification.init();

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
    console.log('[Login] Starting login request...');
    try {
      const result = await auth.login(username, password, rememberMe);
      console.log('[Login] Login result:', result);
      if (result.success) {
        // 약관 동의가 필요한 경우 모달 표시
        if (result.requiresTermsAgreement) {
          const user = get(currentUser);
          if (user) {
            pendingUserId = user.userId;
            showTermsModal = true;
            // 모달이 표시된 상태이므로 여기서 리턴 (navigateToStartPage 호출 안 함)
            return;
          }
        }
        // 약관 동의 필요 없으면 바로 이동
        await navigateToStartPage();
      } else {
        error = result.message;
      }
    } catch (e) {
      console.error('[Login] Login error:', e);
      error = "로그인 중 오류가 발생했습니다.";
    } finally {
      loading = false;
    }
  }

  function handleTermsAgreed() {
    showTermsModal = false;
    pendingUserId = null;
    navigateToStartPage();
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

    <div class="help-links">
      <a href="{base}/find-username">아이디 찾기</a>
      <span class="divider"></span>
      <a href="{base}/forgot-password">비밀번호 찾기</a>
    </div>

    <div class="options-row">
      <label class="checkbox-label">
        <input
          type="checkbox"
          bind:checked={rememberMe}
        />
        <span class="checkbox-text">자동 로그인</span>
      </label>
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

{#if showTermsModal && pendingUserId}
  <TermsAgreementModal
    userId={pendingUserId}
    show={showTermsModal}
    on:agreed={handleTermsAgreed}
  />
{/if}

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

  .help-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    margin-top: calc(-1 * var(--space-2));
  }

  .help-links a {
    font-size: 14px;
    color: var(--text-tertiary);
    transition: color var(--duration-fast) var(--ease);
  }

  .help-links a:hover {
    color: var(--accent);
  }

  .help-links .divider {
    width: 1px;
    height: 12px;
    background: var(--border);
  }

  .options-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .checkbox-text {
    font-size: 15px;
    color: var(--text-secondary);
    user-select: none;
  }
</style>
