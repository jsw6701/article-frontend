<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import type { TrendingItem, PopularCard } from "$lib/types";
  import { getTrending, getPopularCards } from "$lib/api";
  import { getGroupLabel, formatViewCount } from "$lib/utils/labels";
  import { isLoggedIn } from "$lib/stores/auth";
  import LifecycleBadge from "$lib/components/LifecycleBadge.svelte";

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

<svelte:head>
  <title>트렌드 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="header">
    <h1 class="title">트렌드</h1>
    <p class="subtitle">{activeTab === 'trend' ? '기사가 많이 나온 이슈' : '조회수가 높은 이슈'}</p>
  </header>

  <!-- 세그먼트 컨트롤 -->
  <div class="segment-control">
    <button
      class="segment"
      class:active={activeTab === 'trend'}
      on:click={() => activeTab = 'trend'}
    >
      실시간
    </button>
    <button
      class="segment"
      class:active={activeTab === 'popular'}
      on:click={() => activeTab = 'popular'}
    >
      인기
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="message-box">
      <p>{error}</p>
      <button class="action-btn" on:click={() => location.reload()}>다시 시도</button>
    </div>
  {:else}
    <div class="list">
      {#if activeTab === 'trend'}
        {#if trends.length === 0}
          <div class="message-box">
            <p>트렌딩 이슈가 없습니다</p>
          </div>
        {:else}
          {#each trends as item, i}
            <a href="{base}/cards/{item.issueId}" class="card">
              <div class="card-top">
                <span class="rank" class:top={i < 3}>{i + 1}</span>
                <span class="category">{getGroupLabel(item.issueGroup)}</span>
                {#if item.lifecycle}
                  <LifecycleBadge lifecycle={item.lifecycle} showChange={true} />
                {/if}
              </div>
              <h2 class="card-title">{getDisplayTitle(item)}</h2>
              {#if item.signalSummary}
                <p class="card-summary">{item.signalSummary}</p>
              {:else if item.conclusion}
                <p class="card-summary">{item.conclusion}</p>
              {/if}
              <div class="card-meta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <span>{item.articleCount}개 기사</span>
              </div>
            </a>
          {/each}
        {/if}
      {:else}
        {#if popular.length === 0}
          <div class="message-box">
            <p>인기 이슈가 없습니다</p>
          </div>
        {:else}
          {#each popular as item, i}
            <a href="{base}/cards/{item.card.issueId}" class="card">
              <div class="card-top">
                <span class="rank" class:top={i < 3}>{i + 1}</span>
                <span class="category">{getGroupLabel(item.card.issueGroup)}</span>
                {#if item.card.lifecycle}
                  <LifecycleBadge lifecycle={item.card.lifecycle} showChange={true} />
                {/if}
              </div>
              <h2 class="card-title">{getPopularDisplayTitle(item)}</h2>
              {#if item.card.signalSummary}
                <p class="card-summary">{item.card.signalSummary}</p>
              {:else if item.card.conclusion}
                <p class="card-summary">{item.card.conclusion}</p>
              {/if}
              <div class="card-meta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                </svg>
                <span>{formatViewCount(item.viewCount)} 조회</span>
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
    gap: var(--space-5);
  }

  .header {
    padding-top: var(--space-4);
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 15px;
    color: var(--text-tertiary);
    margin: var(--space-1) 0 0;
  }

  /* 세그먼트 컨트롤 */
  .segment-control {
    display: flex;
    background: var(--bg-tertiary);
    padding: 3px;
    border-radius: var(--radius);
    align-self: flex-start;
  }

  .segment {
    padding: var(--space-2) var(--space-4);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-tertiary);
    border-radius: 9px;
    transition: all var(--duration) var(--ease);
    white-space: nowrap;
  }

  .segment.active {
    background: var(--bg-elevated);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2.5px solid var(--separator);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .message-box {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    text-align: center;
  }

  .message-box p {
    color: var(--text-secondary);
    font-size: 16px;
    margin: 0;
  }

  .action-btn {
    margin-top: var(--space-4);
    padding: var(--space-3) var(--space-5);
    background: var(--accent);
    color: white;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius);
  }

  /* 카드 리스트 */
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .card {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: block;
    transition: transform var(--duration) var(--ease);
  }

  .card:active {
    transform: scale(0.98);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .rank {
    min-width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-tertiary);
    background: var(--bg-tertiary);
    border-radius: 6px;
  }

  .rank.top {
    color: white;
    background: var(--accent);
  }

  .category {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
  }

  /* 제목 - 가독성 최적화 */
  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.5;
    margin: 0 0 var(--space-2);
    letter-spacing: -0.01em;
  }

  /* 요약 - 가독성 최적화 */
  .card-summary {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--text-tertiary);
  }

  .card-meta svg {
    opacity: 0.6;
  }
</style>
