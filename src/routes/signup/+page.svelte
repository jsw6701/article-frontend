<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from "$app/navigation";
  import { signUp, checkUsername } from "$lib/api";
  import type { Gender, AgeGroup } from "$lib/types";

  let username = "";
  let password = "";
  let passwordConfirm = "";
  let gender: Gender = "MALE";
  let ageGroup: AgeGroup = "TWENTIES";

  let usernameStatus: { checking: boolean; available: boolean | null; message: string } = {
    checking: false,
    available: null,
    message: "",
  };
  let error = "";
  let loading = false;

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

    loading = true;
    try {
      const res = await signUp({ username, password, gender, ageGroup });
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

  const ageGroupLabels: Record<AgeGroup, string> = {
    TEENS: "10대",
    TWENTIES: "20대",
    THIRTIES: "30대",
    FORTIES: "40대",
    FIFTIES: "50대",
    SIXTIES_PLUS: "60대 이상",
  };
</script>

<div class="page">
  <header class="page-header">
    <h1>회원가입</h1>
    <p>새 계정을 만드세요</p>
  </header>

  <form class="form" on:submit|preventDefault={handleSubmit}>
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

    <div class="field">
      <label>성별</label>
      <div class="radio-group">
        <label class="radio" class:active={gender === 'MALE'}>
          <input type="radio" bind:group={gender} value="MALE" />
          남성
        </label>
        <label class="radio" class:active={gender === 'FEMALE'}>
          <input type="radio" bind:group={gender} value="FEMALE" />
          여성
        </label>
      </div>
    </div>

    <div class="field">
      <label for="ageGroup">연령대</label>
      <select id="ageGroup" bind:value={ageGroup}>
        {#each Object.entries(ageGroupLabels) as [value, label]}
          <option {value}>{label}</option>
        {/each}
      </select>
    </div>

    {#if error}
      <div class="error-msg">{error}</div>
    {/if}

    <button type="submit" class="submit" disabled={loading}>
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

  .page-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0 0 4px;
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

  .field > label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-body);
  }

  .field input[type="text"],
  .field input[type="password"] {
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

  .field input.success {
    border-color: var(--accent-green);
  }

  .field input.error {
    border-color: var(--accent-red);
  }

  .hint {
    font-size: 12px;
    color: var(--text-sub);
  }

  .hint.success {
    color: var(--accent-green);
  }

  .hint.error {
    color: var(--accent-red);
  }

  .field select {
    padding: var(--space-3);
    font-size: 15px;
    color: var(--text-main);
    background: var(--card-hover);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .field select:focus {
    outline: none;
    border-color: var(--accent);
  }

  .radio-group {
    display: flex;
    gap: var(--space-2);
  }

  .radio {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3);
    font-size: 14px;
    color: var(--text-body);
    background: var(--card-hover);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.15s;
  }

  .radio:hover {
    border-color: var(--border-light);
  }

  .radio.active {
    color: var(--accent);
    border-color: var(--accent);
    background: rgba(59, 130, 246, 0.1);
  }

  .radio input {
    display: none;
  }

  .error-msg {
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
