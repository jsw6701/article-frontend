<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ApiErrorType } from '$lib/api';

  export let errorType: ApiErrorType = 'UNKNOWN';
  export let message: string = '';
  export let retryable: boolean = true;
  export let loading: boolean = false;

  const dispatch = createEventDispatcher<{
    retry: void;
  }>();

  function getErrorInfo(type: ApiErrorType) {
    switch (type) {
      case 'NETWORK_ERROR':
        return {
          icon: '📡',
          title: '연결 오류',
          description: message || '인터넷 연결을 확인해주세요.'
        };
      case 'TIMEOUT':
        return {
          icon: '⏱️',
          title: '시간 초과',
          description: message || '요청 시간이 초과되었습니다.'
        };
      case 'SERVER_ERROR':
        return {
          icon: '🔧',
          title: '서버 오류',
          description: message || '서버에 문제가 발생했습니다.'
        };
      case 'NOT_FOUND':
        return {
          icon: '🔍',
          title: '찾을 수 없음',
          description: message || '요청한 정보를 찾을 수 없습니다.'
        };
      case 'AUTH_ERROR':
        return {
          icon: '🔒',
          title: '인증 오류',
          description: message || '다시 로그인해주세요.'
        };
      default:
        return {
          icon: '⚠️',
          title: '오류 발생',
          description: message || '알 수 없는 오류가 발생했습니다.'
        };
    }
  }

  $: errorInfo = getErrorInfo(errorType);

  function handleRetry() {
    dispatch('retry');
  }
</script>

<div class="network-error">
  <div class="error-icon">{errorInfo.icon}</div>
  <h3 class="error-title">{errorInfo.title}</h3>
  <p class="error-description">{errorInfo.description}</p>

  {#if retryable}
    <button
      class="retry-btn"
      on:click={handleRetry}
      disabled={loading}
    >
      {#if loading}
        <span class="spinner"></span>
        재시도 중...
      {:else}
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20.49 9A9 9 0 005.64 5.64L4 7m16 10l-1.64 1.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        다시 시도
      {/if}
    </button>
  {/if}
</div>

<style>
  .network-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-7) var(--space-4);
    text-align: center;
    animation: fadeUp 0.3s var(--ease);
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: var(--space-4);
  }

  .error-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  .error-description {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: var(--space-5);
    max-width: 280px;
  }

  .retry-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    font-size: 15px;
    font-weight: 600;
    color: white;
    background: var(--accent);
    border-radius: var(--radius);
    transition: all var(--duration-fast) var(--ease);
  }

  .retry-btn:disabled {
    opacity: 0.7;
  }

  .retry-btn:not(:disabled):active {
    transform: scale(0.96);
    opacity: 0.9;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
