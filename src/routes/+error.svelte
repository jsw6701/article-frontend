<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';

  $: status = $page.status;
  $: message = $page.error?.message || '알 수 없는 오류가 발생했습니다';

  function getErrorInfo(status: number) {
    switch (status) {
      case 404:
        return {
          title: '페이지를 찾을 수 없습니다',
          description: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
          icon: '🔍'
        };
      case 403:
        return {
          title: '접근 권한이 없습니다',
          description: '이 페이지에 접근할 권한이 없습니다.',
          icon: '🔒'
        };
      case 500:
        return {
          title: '서버 오류',
          description: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          icon: '⚠️'
        };
      default:
        return {
          title: '오류가 발생했습니다',
          description: message,
          icon: '😵'
        };
    }
  }

  $: errorInfo = getErrorInfo(status);

  function goHome() {
    goto(`${base}/`);
  }

  function goBack() {
    history.back();
  }

  function retry() {
    location.reload();
  }
</script>

<svelte:head>
  <title>{errorInfo.title} - SHIFT</title>
</svelte:head>

<div class="error-page">
  <div class="error-content">
    <div class="error-icon">{errorInfo.icon}</div>
    <div class="error-code">{status}</div>
    <h1 class="error-title">{errorInfo.title}</h1>
    <p class="error-description">{errorInfo.description}</p>

    <div class="error-actions">
      <button class="btn btn-primary" on:click={goHome}>
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6a1 1 0 00-1-1h-4a1 1 0 00-1 1v6H4a1 1 0 01-1-1V9.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
        홈으로
      </button>
      <button class="btn btn-secondary" on:click={goBack}>
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M19 12H5m0 0l6 6m-6-6l6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        뒤로가기
      </button>
      {#if status >= 500}
        <button class="btn btn-tertiary" on:click={retry}>
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L4 7m16 10l-1.64 1.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          다시 시도
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    text-align: center;
  }

  .error-content {
    max-width: 400px;
    animation: fadeUp 0.4s var(--ease);
  }

  .error-icon {
    font-size: 64px;
    margin-bottom: var(--space-4);
  }

  .error-code {
    font-size: 72px;
    font-weight: 800;
    color: var(--text-tertiary);
    line-height: 1;
    margin-bottom: var(--space-3);
  }

  .error-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--space-3);
  }

  .error-description {
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--space-6);
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-4);
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--radius);
    transition: all var(--duration-fast) var(--ease);
  }

  .btn-primary {
    background: var(--accent);
    color: white;
  }

  .btn-primary:active {
    opacity: 0.8;
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .btn-secondary:active {
    background: var(--bg-tertiary);
  }

  .btn-tertiary {
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
  }

  .btn-tertiary:active {
    background: var(--accent-glow);
  }
</style>
