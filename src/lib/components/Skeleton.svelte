<script lang="ts">
  // 스켈레톤 타입
  export let type: 'text' | 'title' | 'avatar' | 'button' | 'card' | 'rank-item' | 'custom' = 'text';
  export let width: string = '100%';
  export let height: string = '';
  export let lines: number = 1;
  export let rounded: boolean = false;
</script>

{#if type === 'card'}
  <div class="skeleton-card">
    <div class="skeleton-card-header">
      <div class="skeleton shimmer" style="width: 60px; height: 16px;"></div>
      <div class="skeleton shimmer" style="width: 50px; height: 14px;"></div>
    </div>
    <div class="skeleton shimmer" style="width: 90%; height: 20px; margin-bottom: 8px;"></div>
    <div class="skeleton shimmer" style="width: 100%; height: 16px; margin-bottom: 4px;"></div>
    <div class="skeleton shimmer" style="width: 70%; height: 16px; margin-bottom: 12px;"></div>
    <div class="skeleton-card-footer">
      <div class="skeleton shimmer" style="width: 80px; height: 14px;"></div>
    </div>
  </div>
{:else if type === 'rank-item'}
  <div class="skeleton-rank">
    <div class="skeleton shimmer" style="width: 24px; height: 24px; border-radius: 4px;"></div>
    <div class="skeleton-rank-content">
      <div class="skeleton shimmer" style="width: 80%; height: 16px; margin-bottom: 6px;"></div>
      <div class="skeleton shimmer" style="width: 60%; height: 14px;"></div>
    </div>
    <div class="skeleton shimmer" style="width: 40px; height: 14px;"></div>
  </div>
{:else if type === 'title'}
  <div class="skeleton shimmer title" style="width: {width};"></div>
{:else if type === 'avatar'}
  <div class="skeleton shimmer avatar"></div>
{:else if type === 'button'}
  <div class="skeleton shimmer button" style="width: {width};"></div>
{:else if type === 'custom'}
  <div
    class="skeleton shimmer"
    class:rounded
    style="width: {width}; height: {height};"
  ></div>
{:else}
  {#each Array(lines) as _, i}
    <div
      class="skeleton shimmer text"
      style="width: {i === lines - 1 && lines > 1 ? '70%' : width};"
    ></div>
  {/each}
{/if}

<style>
  .skeleton {
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    position: relative;
    overflow: hidden;
  }

  .skeleton.rounded {
    border-radius: var(--radius-full);
  }

  .shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--bg-secondary) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .text {
    height: 16px;
    margin-bottom: 8px;
  }

  .text:last-child {
    margin-bottom: 0;
  }

  .title {
    height: 24px;
    margin-bottom: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
  }

  .button {
    height: 44px;
    border-radius: var(--radius);
  }

  /* 카드 스켈레톤 */
  .skeleton-card {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .skeleton-card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-3);
  }

  .skeleton-card-footer {
    margin-top: var(--space-2);
  }

  /* 랭킹 아이템 스켈레톤 */
  .skeleton-rank {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--card);
    border-bottom: 0.5px solid var(--separator);
  }

  .skeleton-rank:first-child {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .skeleton-rank:last-child {
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    border-bottom: none;
  }

  .skeleton-rank:only-child {
    border-radius: var(--radius-lg);
  }

  .skeleton-rank-content {
    flex: 1;
  }
</style>
