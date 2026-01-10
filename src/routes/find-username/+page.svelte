<script lang="ts">
  import { base } from '$app/paths';
  import { onDestroy } from 'svelte';
  import ShiftLogo from "$lib/components/ShiftLogo.svelte";
  import { sendPasswordResetEmail, findUsername } from '$lib/api';

  type Step = 'email' | 'verify' | 'result';

  let step: Step = 'email';
  let email = '';
  let code = '';
  let foundUsername = '';
  let error = '';
  let loading = false;
  let expireMinutes = 10;

  // 타이머 관련
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let remainingSeconds = 0;

  $: timerDisplay = remainingSeconds > 0
    ? `${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
    : '';

  $: isTimerExpired = step === 'verify' && remainingSeconds === 0;

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  function startTimer(minutes: number) {
    if (timerInterval) clearInterval(timerInterval);
    remainingSeconds = minutes * 60;
    timerInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
      }
    }, 1000);
  }

  async function handleSendCode() {
    error = '';

    if (!email.trim()) {
      error = '이메일을 입력해주세요.';
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error = '올바른 이메일 형식을 입력해주세요.';
      return;
    }

    loading = true;
    try {
      // 비밀번호 재설정과 동일한 이메일 인증 코드 발송 API 사용
      const res = await sendPasswordResetEmail({ email });
      if (res.success) {
        expireMinutes = res.expireMinutes || 10;
        startTimer(expireMinutes);
        step = 'verify';
      } else {
        error = res.message || '인증 코드 발송에 실패했습니다.';
      }
    } catch (e) {
      error = '서버 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }

  async function handleVerifyCode() {
    error = '';

    if (!code.trim()) {
      error = '인증 코드를 입력해주세요.';
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      error = '6자리 숫자 코드를 입력해주세요.';
      return;
    }

    loading = true;
    try {
      const res = await findUsername({ email, code });
      if (res.success && res.username) {
        foundUsername = res.username;
        step = 'result';
      } else {
        error = res.message || '아이디를 찾을 수 없습니다.';
      }
    } catch (e) {
      error = '서버 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }

  function handleResendCode() {
    code = '';
    error = '';
    handleSendCode();
  }

  function handleBack() {
    if (step === 'verify') {
      step = 'email';
      code = '';
    }
    error = '';
  }

  function maskUsername(username: string): string {
    if (username.length <= 2) {
      return username[0] + '*'.repeat(username.length - 1);
    }
    const visiblePart = Math.ceil(username.length / 2);
    return username.slice(0, visiblePart) + '*'.repeat(username.length - visiblePart);
  }
</script>

<svelte:head>
  <title>아이디 찾기 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="header">
    <ShiftLogo size="lg" />
    <p class="subtitle">
      {#if step === 'email'}
        가입 시 등록한 이메일로 아이디를 찾을 수 있습니다.
      {:else if step === 'verify'}
        이메일로 발송된 인증 코드를 입력해주세요.
      {:else}
        아이디를 찾았습니다.
      {/if}
    </p>
  </header>

  <div class="card">
    {#if step === 'email'}
      <form on:submit|preventDefault={handleSendCode}>
        <div class="field">
          <label for="email">이메일</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            placeholder="가입 시 등록한 이메일"
            autocomplete="email"
          />
        </div>

        {#if error}
          <div class="error">{error}</div>
        {/if}

        <button type="submit" class="submit" disabled={loading}>
          {loading ? '발송 중...' : '인증 코드 받기'}
        </button>
      </form>

    {:else if step === 'verify'}
      <form on:submit|preventDefault={handleVerifyCode}>
        <div class="info-box">
          <p><strong>{email}</strong>으로</p>
          <p>인증 코드를 발송했습니다.</p>
          {#if isTimerExpired}
            <p class="expire expired">인증 코드가 만료되었습니다.</p>
          {:else if timerDisplay}
            <p class="expire">남은 시간: <span class="timer">{timerDisplay}</span></p>
          {:else}
            <p class="expire">코드는 {expireMinutes}분간 유효합니다.</p>
          {/if}
        </div>

        <div class="field">
          <label for="code">인증 코드</label>
          <input
            type="text"
            id="code"
            bind:value={code}
            placeholder="6자리 숫자 코드"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            disabled={isTimerExpired}
          />
        </div>

        {#if error}
          <div class="error">{error}</div>
        {/if}

        <button type="submit" class="submit" disabled={loading || isTimerExpired}>
          {loading ? '확인 중...' : '확인'}
        </button>

        <div class="actions">
          <button type="button" class="link-btn" on:click={handleResendCode} disabled={loading}>
            {isTimerExpired ? '인증 코드 재발송' : '인증 코드 다시 받기'}
          </button>
          <button type="button" class="link-btn" on:click={handleBack}>
            이메일 다시 입력
          </button>
        </div>
      </form>

    {:else}
      <div class="result">
        <div class="result-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--system-green)" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <p class="result-label">가입된 아이디</p>
        <p class="result-username">{maskUsername(foundUsername)}</p>
        <p class="result-hint">보안을 위해 일부가 가려졌습니다.</p>
      </div>

      <div class="result-actions">
        <a href="{base}/login" class="btn-primary">로그인하기</a>
        <a href="{base}/forgot-password" class="btn-secondary">비밀번호 재설정</a>
      </div>
    {/if}
  </div>

  <div class="footer">
    <a href="{base}/login">로그인으로 돌아가기</a>
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
    font-size: 16px;
    color: var(--text-secondary);
    margin: var(--space-3) 0 0;
    line-height: 1.5;
  }

  .card {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  form {
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

  .info-box {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border-radius: var(--radius);
    text-align: center;
    line-height: 1.6;
  }

  .info-box p {
    margin: 0;
    font-size: 15px;
    color: var(--text-secondary);
  }

  .info-box strong {
    color: var(--text-primary);
    word-break: break-all;
  }

  .info-box .expire {
    margin-top: var(--space-2);
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .info-box .expire.expired {
    color: var(--system-red);
  }

  .timer {
    color: var(--accent);
    font-weight: 600;
  }

  .field input:disabled {
    opacity: 0.6;
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

  .actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .link-btn {
    font-size: 14px;
    color: var(--text-tertiary);
    background: none;
    border: none;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease);
    padding: var(--space-2);
  }

  .link-btn:hover:not(:disabled) {
    color: var(--accent);
  }

  .link-btn:disabled {
    opacity: 0.5;
  }

  .result {
    text-align: center;
    padding: var(--space-4) 0;
  }

  .result-icon {
    margin-bottom: var(--space-4);
  }

  .result-label {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0 0 var(--space-2);
  }

  .result-username {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
    letter-spacing: 1px;
  }

  .result-hint {
    font-size: 13px;
    color: var(--text-tertiary);
    margin: 0;
  }

  .result-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }

  .btn-primary {
    padding: var(--space-4);
    font-size: 17px;
    font-weight: 600;
    color: white;
    background: var(--accent);
    border-radius: var(--radius);
    text-align: center;
    text-decoration: none;
    transition: opacity var(--duration-fast) var(--ease);
  }

  .btn-primary:active {
    opacity: 0.8;
  }

  .btn-secondary {
    padding: var(--space-4);
    font-size: 17px;
    font-weight: 600;
    color: var(--accent);
    background: var(--bg-secondary);
    border-radius: var(--radius);
    text-align: center;
    text-decoration: none;
    transition: opacity var(--duration-fast) var(--ease);
  }

  .btn-secondary:active {
    opacity: 0.8;
  }

  .footer {
    text-align: center;
    font-size: 15px;
  }

  .footer a {
    color: var(--text-tertiary);
    transition: color var(--duration-fast) var(--ease);
  }

  .footer a:hover {
    color: var(--accent);
  }
</style>
