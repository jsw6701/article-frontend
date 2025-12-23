<script lang="ts">
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
        usernameStatus.message = "아이디는 4자 이상이어야 합니다.";
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
          message: res.message,
        };
      } catch {
        usernameStatus = {
          checking: false,
          available: null,
          message: "확인 중 오류가 발생했습니다.",
        };
      }
    }, 500);
  }

  async function handleSubmit() {
    error = "";

    if (!username.trim() || username.length < 4) {
      error = "아이디는 4자 이상이어야 합니다.";
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      error = "아이디는 영문, 숫자만 사용 가능합니다.";
      return;
    }
    if (password.length < 8) {
      error = "비밀번호는 8자 이상이어야 합니다.";
      return;
    }
    if (password !== passwordConfirm) {
      error = "비밀번호가 일치하지 않습니다.";
      return;
    }
    if (usernameStatus.available === false) {
      error = "이미 사용 중인 아이디입니다.";
      return;
    }

    loading = true;
    try {
      const res = await signUp({ username, password, gender, ageGroup });
      if (res.success) {
        goto("/login?signup=success");
      } else {
        error = res.message ?? "회원가입에 실패했습니다.";
      }
    } catch {
      error = "서버 오류가 발생했습니다.";
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

<div class="signup-page">
  <div class="signup-card">
    <h1 class="title">회원가입</h1>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="field">
        <label for="username">아이디</label>
        <input
          type="text"
          id="username"
          bind:value={username}
          on:input={handleUsernameInput}
          placeholder="4~20자 영문, 숫자"
          autocomplete="username"
        />
        {#if usernameStatus.checking}
          <span class="field-hint checking">확인 중...</span>
        {:else if usernameStatus.message}
          <span class="field-hint" class:success={usernameStatus.available} class:fail={usernameStatus.available === false}>
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
          <label class="radio-item">
            <input type="radio" bind:group={gender} value="MALE" />
            <span>남성</span>
          </label>
          <label class="radio-item">
            <input type="radio" bind:group={gender} value="FEMALE" />
            <span>여성</span>
          </label>
        </div>
      </div>

      <div class="field">
        <label for="ageGroup">나이대</label>
        <select id="ageGroup" bind:value={ageGroup}>
          {#each Object.entries(ageGroupLabels) as [value, label]}
            <option {value}>{label}</option>
          {/each}
        </select>
      </div>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? "가입 중..." : "회원가입"}
      </button>
    </form>

    <p class="login-link">
      이미 계정이 있으신가요? <a href="/login">로그인</a>
    </p>
  </div>
</div>

<style>
  .signup-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: var(--space-3) 0;
  }

  .signup-card {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    width: 100%;
    max-width: 360px;
    box-shadow: var(--shadow);
  }

  .title {
    font-size: 22px;
    font-weight: 700;
    text-align: center;
    margin-bottom: var(--space-4);
  }

  .field {
    margin-bottom: var(--space-3);
  }

  .field > label:first-child {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-sub);
    margin-bottom: 6px;
  }

  .field input[type="text"],
  .field input[type="password"],
  .field select {
    width: 100%;
    padding: 12px 14px;
    font-size: 15px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
    transition: border-color 0.15s;
  }

  .field input:focus,
  .field select:focus {
    outline: none;
    border-color: var(--accent);
  }

  .field-hint {
    display: block;
    font-size: 12px;
    margin-top: 4px;
  }

  .field-hint.checking {
    color: var(--text-sub);
  }

  .field-hint.success {
    color: #16a34a;
  }

  .field-hint.fail {
    color: #dc2626;
  }

  .radio-group {
    display: flex;
    gap: var(--space-3);
  }

  .radio-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .radio-item input {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
  }

  .radio-item span {
    font-size: 14px;
  }

  select {
    appearance: none;
    cursor: pointer;
  }

  .error {
    color: #dc2626;
    font-size: 13px;
    margin-bottom: var(--space-2);
    text-align: center;
  }

  .submit-btn {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    color: white;
    background: var(--accent);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-link {
    text-align: center;
    font-size: 13px;
    color: var(--text-sub);
    margin-top: var(--space-3);
  }

  .login-link a {
    color: var(--accent);
    font-weight: 500;
  }
</style>
