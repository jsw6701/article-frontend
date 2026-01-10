<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import { signUp, checkUsername, sendEmailVerification, verifyEmail } from "$lib/api";
  import { auth, isLoggedIn } from "$lib/stores/auth";
  import type { Gender, AgeGroup } from "$lib/types";
  import ShiftLogo from "$lib/components/ShiftLogo.svelte";

  // 이미 로그인된 경우 메인으로 리다이렉트
  onMount(() => {
    auth.init();
  });

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  $: if ($isLoggedIn) {
    goto(`${base}/`);
  }

  let username = "";
  let password = "";
  let passwordConfirm = "";
  let email = "";
  let verificationCode = "";
  let gender: Gender = "MALE";
  let ageGroup: AgeGroup = "TWENTIES";

  let usernameStatus: { checking: boolean; available: boolean | null; message: string } = {
    checking: false,
    available: null,
    message: "",
  };

  let emailStatus: {
    sending: boolean;
    sent: boolean;
    verifying: boolean;
    verified: boolean;
    message: string;
    expireMinutes: number | null;
  } = {
    sending: false,
    sent: false,
    verifying: false,
    verified: false,
    message: "",
    expireMinutes: null,
  };

  let error = "";
  let loading = false;

  // 약관 동의
  let agreeTerms = false;
  let agreePrivacy = false;

  // 타이머 관련
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let remainingSeconds = 0;

  $: timerDisplay = remainingSeconds > 0
    ? `${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
    : '';

  $: isTimerExpired = emailStatus.sent && remainingSeconds === 0;

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

  let checkTimeout: ReturnType<typeof setTimeout>;

  function handleUsernameInput() {
    usernameStatus = { checking: false, available: null, message: "" };

    if (username.length < 4) {
      if (username.length > 0) {
        usernameStatus.message = "4자 이상 입력해주세요";
      }
      return;
    }

    clearTimeout(checkTimeout);
    checkTimeout = setTimeout(async () => {
      usernameStatus.checking = true;
      try {
        const res = await checkUsername(username);
        usernameStatus = {
          checking: false,
          available: res.available,
          message: res.available ? "사용 가능" : "이미 사용중",
        };
      } catch {
        usernameStatus = {
          checking: false,
          available: null,
          message: "확인 실패",
        };
      }
    }, 500);
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  async function handleSendVerification() {
    if (!isValidEmail(email)) {
      emailStatus.message = "유효한 이메일을 입력해주세요";
      return;
    }

    emailStatus.sending = true;
    emailStatus.message = "";

    try {
      const res = await sendEmailVerification({ email });
      if (res.success) {
        emailStatus = {
          ...emailStatus,
          sending: false,
          sent: true,
          message: "인증 코드가 발송되었습니다",
          expireMinutes: res.expireMinutes,
        };
        // 타이머 시작
        if (res.expireMinutes) {
          startTimer(res.expireMinutes);
        }
      } else {
        emailStatus = {
          ...emailStatus,
          sending: false,
          message: res.message ?? "발송 실패",
        };
      }
    } catch {
      emailStatus = {
        ...emailStatus,
        sending: false,
        message: "서버 오류",
      };
    }
  }

  async function handleVerifyCode() {
    if (verificationCode.length !== 6) {
      emailStatus.message = "6자리 코드를 입력해주세요";
      return;
    }

    emailStatus.verifying = true;
    emailStatus.message = "";

    try {
      const res = await verifyEmail({ email, code: verificationCode });
      if (res.success) {
        emailStatus = {
          ...emailStatus,
          verifying: false,
          verified: true,
          message: "인증 완료",
        };
      } else {
        emailStatus = {
          ...emailStatus,
          verifying: false,
          message: res.message ?? "인증 실패",
        };
      }
    } catch {
      emailStatus = {
        ...emailStatus,
        verifying: false,
        message: "서버 오류",
      };
    }
  }

  async function handleSubmit() {
    error = "";

    if (!username.trim() || username.length < 4) {
      error = "아이디는 4자 이상이어야 합니다";
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      error = "아이디는 영문과 숫자만 가능합니다";
      return;
    }
    if (!isValidEmail(email)) {
      error = "유효한 이메일을 입력해주세요";
      return;
    }
    if (!emailStatus.verified) {
      error = "이메일 인증이 필요합니다";
      return;
    }
    if (password.length < 8) {
      error = "비밀번호는 8자 이상이어야 합니다";
      return;
    }
    if (password !== passwordConfirm) {
      error = "비밀번호가 일치하지 않습니다";
      return;
    }
    if (usernameStatus.available === false) {
      error = "이미 사용중인 아이디입니다";
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      error = "이용약관 및 개인정보처리방침에 동의해주세요";
      return;
    }

    loading = true;
    try {
      const res = await signUp({ username, password, email, gender, ageGroup });
      if (res.success) {
        goto(`${base}/login?signup=success`);
      } else {
        error = res.message ?? "가입 실패";
      }
    } catch {
      error = "서버 오류가 발생했습니다";
    }
    loading = false;
  }

  const ageGroupOptions: { value: AgeGroup; label: string }[] = [
    { value: "TEENS", label: "10대" },
    { value: "TWENTIES", label: "20대" },
    { value: "THIRTIES", label: "30대" },
    { value: "FORTIES", label: "40대" },
    { value: "FIFTIES", label: "50대" },
    { value: "SIXTIES_PLUS", label: "60대+" },
  ];
</script>

<svelte:head>
  <title>회원가입 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="header">
    <ShiftLogo size="lg" />
    <p class="subtitle">새 계정을 만드세요</p>
  </header>

  <form class="form" on:submit|preventDefault={handleSubmit}>
    <!-- 아이디 -->
    <div class="field">
      <label for="username">아이디</label>
      <input
        type="text"
        id="username"
        bind:value={username}
        on:input={handleUsernameInput}
        placeholder="4자 이상, 영문/숫자"
        autocomplete="username"
        class:success={usernameStatus.available === true}
        class:error={usernameStatus.available === false}
      />
      {#if usernameStatus.checking}
        <span class="hint">확인 중...</span>
      {:else if usernameStatus.message}
        <span class="hint" class:success={usernameStatus.available} class:error={usernameStatus.available === false}>
          {usernameStatus.message}
        </span>
      {/if}
    </div>

    <!-- 이메일 -->
    <div class="field">
      <label for="email">이메일</label>
      <div class="input-row">
        <input
          type="email"
          id="email"
          bind:value={email}
          placeholder="example@email.com"
          autocomplete="email"
          disabled={emailStatus.verified}
          class:success={emailStatus.verified}
        />
        <button
          type="button"
          class="inline-btn"
          on:click={handleSendVerification}
          disabled={emailStatus.sending || emailStatus.verified || !email}
        >
          {#if emailStatus.sending}
            발송중
          {:else if emailStatus.verified}
            완료
          {:else if emailStatus.sent}
            재발송
          {:else}
            인증
          {/if}
        </button>
      </div>
      {#if emailStatus.message && !emailStatus.verified}
        <span class="hint" class:success={emailStatus.sent && !isTimerExpired} class:error={!emailStatus.sent || isTimerExpired}>
          {#if isTimerExpired}
            인증 코드가 만료되었습니다. 다시 발송해주세요.
          {:else}
            {emailStatus.message}
            {#if timerDisplay}
              <span class="timer">({timerDisplay})</span>
            {/if}
          {/if}
        </span>
      {/if}
      {#if emailStatus.verified}
        <span class="hint success">이메일 인증 완료</span>
      {/if}
    </div>

    <!-- 인증 코드 -->
    {#if emailStatus.sent && !emailStatus.verified}
      <div class="field">
        <label for="verificationCode">인증 코드</label>
        <div class="input-row">
          <input
            type="text"
            id="verificationCode"
            bind:value={verificationCode}
            placeholder="6자리 코드"
            maxlength="6"
            inputmode="numeric"
            pattern="[0-9]*"
            disabled={isTimerExpired}
          />
          <button
            type="button"
            class="inline-btn"
            on:click={handleVerifyCode}
            disabled={emailStatus.verifying || verificationCode.length !== 6 || isTimerExpired}
          >
            {emailStatus.verifying ? "확인중" : "확인"}
          </button>
        </div>
        {#if !isTimerExpired}
          <button type="button" class="resend-btn" on:click={handleSendVerification} disabled={emailStatus.sending}>
            인증 코드 재발송
          </button>
        {/if}
      </div>
    {/if}

    <!-- 비밀번호 -->
    <div class="field">
      <label for="password">비밀번호</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        placeholder="8자 이상"
        autocomplete="new-password"
      />
    </div>

    <!-- 비밀번호 확인 -->
    <div class="field">
      <label for="passwordConfirm">비밀번호 확인</label>
      <input
        type="password"
        id="passwordConfirm"
        bind:value={passwordConfirm}
        placeholder="비밀번호 재입력"
        autocomplete="new-password"
      />
    </div>

    <!-- 성별 -->
    <div class="field">
      <label>성별</label>
      <div class="segment-control">
        <button
          type="button"
          class="segment"
          class:active={gender === 'MALE'}
          on:click={() => gender = 'MALE'}
        >
          남성
        </button>
        <button
          type="button"
          class="segment"
          class:active={gender === 'FEMALE'}
          on:click={() => gender = 'FEMALE'}
        >
          여성
        </button>
      </div>
    </div>

    <!-- 연령대 -->
    <div class="field">
      <label>연령대</label>
      <div class="segment-control wide">
        {#each ageGroupOptions as opt}
          <button
            type="button"
            class="segment"
            class:active={ageGroup === opt.value}
            on:click={() => ageGroup = opt.value}
          >
            {opt.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- 약관 동의 -->
    <div class="agreements">
      <label class="agreement">
        <input type="checkbox" bind:checked={agreeTerms} />
        <span class="checkbox-custom"></span>
        <span class="agreement-text">
          <a href="{base}/terms" target="_blank" rel="noopener">서비스 이용약관</a>에 동의합니다 (필수)
        </span>
      </label>
      <label class="agreement">
        <input type="checkbox" bind:checked={agreePrivacy} />
        <span class="checkbox-custom"></span>
        <span class="agreement-text">
          <a href="{base}/privacy" target="_blank" rel="noopener">개인정보처리방침</a>에 동의합니다 (필수)
        </span>
      </label>
    </div>

    {#if error}
      <div class="error-msg">{error}</div>
    {/if}

    <button type="submit" class="submit" disabled={loading || !agreeTerms || !agreePrivacy}>
      {loading ? "가입 중..." : "회원가입"}
    </button>
  </form>

  <div class="footer">
    <span>이미 계정이 있으신가요?</span>
    <a href="{base}/login">로그인</a>
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

  .field input.success {
    box-shadow: 0 0 0 2px var(--system-green);
  }

  .field input.error {
    box-shadow: 0 0 0 2px var(--system-red);
  }

  .field input:disabled {
    opacity: 0.6;
  }

  .input-row {
    display: flex;
    gap: var(--space-2);
  }

  .input-row input {
    flex: 1;
    min-width: 0;
  }

  .inline-btn {
    padding: 0 var(--space-4);
    font-size: 15px;
    font-weight: 600;
    color: var(--accent);
    background: var(--bg-tertiary);
    border-radius: var(--radius);
    white-space: nowrap;
    transition: all var(--duration-fast) var(--ease);
  }

  .inline-btn:disabled {
    opacity: 0.5;
  }

  .inline-btn:not(:disabled):active {
    background: var(--bg-secondary);
  }

  .hint {
    font-size: 13px;
    color: var(--text-tertiary);
    padding-left: var(--space-1);
  }

  .hint.success {
    color: var(--system-green);
  }

  .hint.error {
    color: var(--system-red);
  }

  /* 세그먼트 컨트롤 */
  .segment-control {
    display: flex;
    gap: var(--space-2);
  }

  .segment-control.wide {
    flex-wrap: wrap;
  }

  .segment {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    font-size: 15px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border-radius: var(--radius);
    transition: all var(--duration-fast) var(--ease);
    white-space: nowrap;
    min-width: 0;
  }

  .segment-control.wide .segment {
    flex: 0 0 auto;
    padding: var(--space-3);
    font-size: 14px;
  }

  .segment:active {
    transform: scale(0.98);
  }

  .segment.active {
    color: white;
    background: var(--accent);
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

  /* 약관 동의 */
  .agreements {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border-radius: var(--radius);
  }

  .agreement {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    user-select: none;
  }

  .agreement input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkbox-custom {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid var(--text-tertiary);
    background: transparent;
    transition: all var(--duration-fast) var(--ease);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .agreement input[type="checkbox"]:checked + .checkbox-custom {
    background: var(--accent);
    border-color: var(--accent);
  }

  .agreement input[type="checkbox"]:checked + .checkbox-custom::after {
    content: '';
    width: 6px;
    height: 10px;
    border: 2px solid white;
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translateY(-1px);
  }

  .agreement-text {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .agreement-text a {
    color: var(--accent);
    text-decoration: underline;
    font-weight: 500;
  }

  /* 타이머 */
  .timer {
    font-weight: 600;
    color: var(--accent);
  }

  /* 재발송 버튼 */
  .resend-btn {
    margin-top: var(--space-2);
    font-size: 13px;
    color: var(--text-tertiary);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-1);
    transition: color var(--duration-fast) var(--ease);
  }

  .resend-btn:hover:not(:disabled) {
    color: var(--accent);
  }

  .resend-btn:disabled {
    opacity: 0.5;
  }
</style>
