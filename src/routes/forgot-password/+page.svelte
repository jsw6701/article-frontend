<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import { sendPasswordResetEmail, resetPassword } from "$lib/api";
  import ShiftLogo from "$lib/components/ShiftLogo.svelte";

  let step: 'email' | 'verify' | 'reset' | 'done' = 'email';

  let email = "";
  let verificationCode = "";
  let newPassword = "";
  let newPasswordConfirm = "";

  let loading = false;
  let error = "";
  let message = "";
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

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  async function handleSendEmail() {
    error = "";
    message = "";

    if (!isValidEmail(email)) {
      error = "유효한 이메일을 입력해주세요";
      return;
    }

    loading = true;
    try {
      const res = await sendPasswordResetEmail({ email });
      if (res.success) {
        message = `인증 코드가 ${email}로 발송되었습니다`;
        expireMinutes = res.expireMinutes || 10;
        startTimer(expireMinutes);
        step = 'verify';
      } else {
        error = res.message ?? "발송에 실패했습니다";
      }
    } catch {
      error = "서버 오류가 발생했습니다";
    }
    loading = false;
  }

  async function handleVerifyAndReset() {
    error = "";

    if (verificationCode.length !== 6) {
      error = "6자리 인증 코드를 입력해주세요";
      return;
    }

    if (newPassword.length < 8) {
      error = "비밀번호는 8자 이상이어야 합니다";
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      error = "비밀번호가 일치하지 않습니다";
      return;
    }

    loading = true;
    try {
      const res = await resetPassword({
        email,
        code: verificationCode,
        newPassword
      });
      if (res.success) {
        step = 'done';
      } else {
        error = res.message ?? "비밀번호 재설정에 실패했습니다";
      }
    } catch {
      error = "서버 오류가 발생했습니다";
    }
    loading = false;
  }

  function goToLogin() {
    goto(`${base}/login`);
  }
</script>

<svelte:head>
  <title>비밀번호 찾기 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="header">
    <ShiftLogo size="lg" />
    <p class="subtitle">
      {#if step === 'email'}
        가입한 이메일을 입력하세요
      {:else if step === 'verify'}
        인증 코드와 새 비밀번호를 입력하세요
      {:else if step === 'done'}
        비밀번호가 변경되었습니다
      {/if}
    </p>
  </header>

  {#if step === 'email'}
    <form class="form" on:submit|preventDefault={handleSendEmail}>
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
        <div class="error-msg">{error}</div>
      {/if}

      {#if message}
        <div class="success-msg">{message}</div>
      {/if}

      <button type="submit" class="submit" disabled={loading || !email}>
        {loading ? "발송 중..." : "인증 코드 받기"}
      </button>
    </form>

  {:else if step === 'verify'}
    <form class="form" on:submit|preventDefault={handleVerifyAndReset}>
      <div class="field">
        <label for="email-display">이메일</label>
        <input
          type="email"
          id="email-display"
          value={email}
          disabled
        />
      </div>

      <div class="field">
        <label for="code">인증 코드</label>
        <input
          type="text"
          id="code"
          bind:value={verificationCode}
          placeholder="6자리 코드"
          maxlength="6"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="one-time-code"
          disabled={isTimerExpired}
        />
        {#if isTimerExpired}
          <span class="hint error">인증 코드가 만료되었습니다. 다시 발송해주세요.</span>
        {:else if timerDisplay}
          <span class="hint">이메일로 발송된 6자리 코드를 입력하세요 <span class="timer">({timerDisplay})</span></span>
        {:else}
          <span class="hint">이메일로 발송된 6자리 코드를 입력하세요</span>
        {/if}
      </div>

      <div class="field">
        <label for="newPassword">새 비밀번호</label>
        <input
          type="password"
          id="newPassword"
          bind:value={newPassword}
          placeholder="8자 이상"
          autocomplete="new-password"
        />
      </div>

      <div class="field">
        <label for="newPasswordConfirm">새 비밀번호 확인</label>
        <input
          type="password"
          id="newPasswordConfirm"
          bind:value={newPasswordConfirm}
          placeholder="비밀번호 재입력"
          autocomplete="new-password"
        />
      </div>

      {#if error}
        <div class="error-msg">{error}</div>
      {/if}

      <button type="submit" class="submit" disabled={loading || isTimerExpired}>
        {loading ? "변경 중..." : "비밀번호 변경"}
      </button>

      <button type="button" class="secondary-btn" on:click={handleSendEmail} disabled={loading}>
        {isTimerExpired ? "인증 코드 재발송" : "다른 이메일로 다시 시도"}
      </button>
    </form>

  {:else if step === 'done'}
    <div class="form">
      <div class="done-icon">✓</div>
      <p class="done-text">비밀번호가 성공적으로 변경되었습니다.<br />새 비밀번호로 로그인해주세요.</p>
      <button class="submit" on:click={goToLogin}>
        로그인하러 가기
      </button>
    </div>
  {/if}

  <div class="footer">
    <a href="{base}/login">← 로그인으로 돌아가기</a>
  </div>
</div>

<style>
  .page {
    max-width: 380px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding-top: var(--space-3);
  }

  .header {
    text-align: center;
    padding: var(--space-4) 0;
  }

  .subtitle {
    font-size: 17px;
    color: var(--text-secondary);
    margin: var(--space-3) 0 0;
    line-height: 1.5;
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

  .field > label {
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

  .field input:disabled {
    opacity: 0.6;
  }

  .hint {
    font-size: 13px;
    color: var(--text-tertiary);
    padding-left: var(--space-1);
  }

  .error-msg {
    font-size: 15px;
    color: var(--system-red);
    padding: var(--space-4);
    background: rgba(255, 59, 48, 0.1);
    border-radius: var(--radius);
    text-align: center;
    line-height: 1.5;
  }

  .success-msg {
    font-size: 15px;
    color: var(--system-green);
    padding: var(--space-4);
    background: rgba(52, 199, 89, 0.1);
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

  .secondary-btn {
    padding: var(--space-3);
    font-size: 15px;
    font-weight: 500;
    color: var(--text-secondary);
    background: transparent;
    border-radius: var(--radius);
  }

  .secondary-btn:active {
    background: var(--bg-secondary);
  }

  .done-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto;
    background: var(--system-green);
    color: white;
    font-size: 32px;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .done-text {
    font-size: 16px;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.6;
  }

  .footer {
    text-align: center;
    font-size: 16px;
  }

  .footer a {
    color: var(--accent);
    font-weight: 500;
  }

  .timer {
    color: var(--accent);
    font-weight: 600;
  }

  .hint.error {
    color: var(--system-red);
  }
</style>
