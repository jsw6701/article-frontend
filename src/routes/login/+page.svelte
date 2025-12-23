<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/stores/auth";

  let username = "";
  let password = "";
  let error = "";
  let loading = false;

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
      goto("/");
    } else {
      error = result.message;
    }
  }
</script>

<div class="login-page">
  <div class="login-card">
    <h1 class="title">로그인</h1>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="field">
        <label for="username">아이디</label>
        <input
          type="text"
          id="username"
          bind:value={username}
          placeholder="아이디를 입력하세요"
          autocomplete="username"
        />
      </div>

      <div class="field">
        <label for="password">비밀번호</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="비밀번호를 입력하세요"
          autocomplete="current-password"
        />
      </div>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>

    <p class="signup-link">
      계정이 없으신가요? <a href="/signup">회원가입</a>
    </p>
  </div>
</div>

<style>
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .login-card {
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

  .field label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-sub);
    margin-bottom: 6px;
  }

  .field input {
    width: 100%;
    padding: 12px 14px;
    font-size: 15px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
    transition: border-color 0.15s;
  }

  .field input:focus {
    outline: none;
    border-color: var(--accent);
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

  .signup-link {
    text-align: center;
    font-size: 13px;
    color: var(--text-sub);
    margin-top: var(--space-3);
  }

  .signup-link a {
    color: var(--accent);
    font-weight: 500;
  }
</style>
