<script lang="ts">
  import { base } from '$app/paths';
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
      goto(`${base}/`);
    } else {
      error = result.message;
    }
  }
</script>

<div class="page">
  <header class="page-header">
    <h1>로그인</h1>
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
