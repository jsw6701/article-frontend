<script lang="ts">
  import { showOfflineBanner, offlineBanner } from '$lib/stores/network';
  import { fly } from 'svelte/transition';

  function dismiss() {
    offlineBanner.dismiss();
  }
</script>

{#if $showOfflineBanner}
  <div
    class="offline-banner"
    transition:fly={{ y: -50, duration: 300 }}
    role="alert"
  >
    <div class="banner-content">
      <svg viewBox="0 0 24 24" fill="none" class="banner-icon" width="20" height="20">
        <path d="M1 1l22 22M9 9a6 6 0 008.5 8.5M5.64 5.64A10 10 0 0019 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="18" r="1" fill="currentColor"/>
      </svg>
      <span class="banner-text">오프라인 상태입니다</span>
    </div>
    <button class="dismiss-btn" on:click={dismiss} aria-label="닫기">
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
{/if}

<style>
  .offline-banner {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    padding-top: calc(var(--space-3) + env(safe-area-inset-top, 0px));
    background: var(--system-orange);
    color: white;
    z-index: 1001;
    box-shadow: var(--shadow);
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .banner-icon {
    flex-shrink: 0;
  }

  .banner-text {
    font-size: 14px;
    font-weight: 600;
  }

  .dismiss-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
    color: white;
    opacity: 0.8;
    transition: opacity var(--duration-fast) var(--ease);
  }

  .dismiss-btn:hover,
  .dismiss-btn:active {
    opacity: 1;
  }
</style>
