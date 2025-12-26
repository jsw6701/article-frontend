<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import type { TrendingItem, PopularCard } from "$lib/types";
  import { getTrending, getPopularCards } from "$lib/api";
  import { getGroupLabel, formatViewCount } from "$lib/utils/labels";
  import { isLoggedIn } from "$lib/stores/auth";

  let trends: TrendingItem[] = [];
  let popular: PopularCard[] = [];
  let loading = true;
  let error: string | null = null;

  // 탭 상태
  let activeTab: 'trend' | 'popular' = 'trend';

  onMount(() => {
    const unsubscribe = isLoggedIn.subscribe(async (loggedIn) => {
      if (loggedIn) {
        try {
          const [trendRes, popularRes] = await Promise.all([
            getTrending({ limit: 10 }),
            getPopularCards({ limit: 10 })
          ]);
          trends = trendRes.items;
          popular = popularRes.items;
        } catch (e: any) {
          error = e?.message ?? "불러오기 실패";
        } finally {
          loading = false;
        }
        unsubscribe();
      }
    });
    return unsubscribe;
  });

  function getDisplayTitle(item: TrendingItem): string {
    return item.headline || item.issueTitle;
  }

  function getPopularDisplayTitle(item: PopularCard): string {
    return item.card.headline || item.card.issueTitle;
  }
</script>

<div class="page">
  <header class="page-header">
    <h1>트렌딩</h1>
    <p>{activeTab === 'trend' ? '기사가 많이 나온 이슈' : '조회수가 높은 이슈'}</p>
  </header>

  <!-- 탭 -->
  <div class="tab-header">
    <button
      class="tab-btn"
      class:active={activeTab === 'trend'}
      on:click={() => activeTab = 'trend'}
    >
      화제
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'popular'}
      on:click={() => activeTab = 'popular'}
    >
      조회수
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => location.reload()}>다시 시도</button>
    </div>
  {:else}
    <div class="list">
      {#if activeTab === 'trend'}
        {#if trends.length === 0}
          <div class="empty">
            <p>트렌딩 이슈가 없습니다</p>
          </div>
        {:else}
          {#each trends as item, i}
            <a href="{base}/cards/{item.issueId}" class="item">
              <div class="rank" class:top={i < 3}>{i + 1}</div>
              <div class="content">
                <span class="cat">{getGroupLabel(item.issueGroup)}</span>
                <h2 class="title">{getDisplayTitle(item)}</h2>
                {#if item.signalSummary}
                  <p class="summary">{item.signalSummary}</p>
                {:else if item.conclusion}
                  <p class="summary">{item.conclusion}</p>
                {/if}
                <div class="stats">
                  <span class="stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    {item.articleCount}개 기사
                  </span>
                </div>
              </div>
            </a>
          {/each}
        {/if}
      {:else}
        {#if popular.length === 0}
          <div class="empty">
            <p>인기 이슈가 없습니다</p>
          </div>
        {:else}
          {#each popular as item, i}
            <a href="{base}/cards/{item.card.issueId}" class="item">
              <div class="rank" class:top={i < 3}>{i + 1}</div>
              <div class="content">
                <span class="cat">{getGroupLabel(item.card.issueGroup)}</span>
                <h2 class="title">{getPopularDisplayTitle(item)}</h2>
                {#if item.card.signalSummary}
                  <p class="summary">{item.card.signalSummary}</p>
                {:else if item.card.conclusion}
                  <p class="summary">{item.card.conclusion}</p>
                {/if}
                <div class="stats">
                  <span class="stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {formatViewCount(item.viewCount)} 조회
                  </span>
                </div>
              </div>
            </a>
          {/each}
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .page-header {
    padding: var(--space-2) 0;
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

  /* 탭 */
  .tab-header {
    display: flex;
    gap: var(--space-1);
    padding: 4px;
    background: var(--card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }

  .tab-btn {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-sub);
    background: transparent;
    border-radius: var(--radius);
    transition: all 0.15s;
  }

  .tab-btn:hover {
    color: var(--text-main);
  }

  .tab-btn.active {
    color: var(--text-main);
    background: var(--card-hover);
  }

  .loading {
    display: flex;
    justify-content: center;
    padding: var(--space-6) 0;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error, .empty {
    text-align: center;
    padding: var(--space-6) 0;
    color: var(--text-sub);
  }

  .error button {
    margin-top: var(--space-3);
    padding: var(--space-2) var(--space-4);
    background: var(--accent);
    color: white;
    font-size: 13px;
    font-weight: 500;
    border-radius: var(--radius);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .item {
    display: flex;
    gap: var(--space-4);
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    transition: border-color 0.15s;
  }

  .item:hover {
    border-color: var(--border-light);
  }

  .rank {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-sub);
    background: var(--card-hover);
    border-radius: var(--radius);
  }

  .rank.top {
    color: white;
    background: var(--accent);
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  .cat {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    line-height: 1.4;
    margin: 4px 0 var(--space-2);
  }

  .item:hover .title {
    color: var(--accent);
  }

  .summary {
    font-size: 13px;
    color: var(--text-body);
    line-height: 1.5;
    margin: 0 0 var(--space-2);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .stats {
    display: flex;
    gap: var(--space-3);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-sub);
  }

  .stat svg {
    width: 12px;
    height: 12px;
  }
</style>
