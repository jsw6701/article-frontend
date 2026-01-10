<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import type { CardListItem, TrendingItem, PopularCard } from "$lib/types";
  import { listCards, getTrending, getPopularCards, ApiError, type ApiErrorType } from "$lib/api";
  import { getGroupLabel, formatViewCount } from "$lib/utils/labels";
  import { isLoggedIn } from "$lib/stores/auth";
  import LifecycleBadge from "$lib/components/LifecycleBadge.svelte";
  import NetworkError from "$lib/components/NetworkError.svelte";

  let cards: CardListItem[] = [];
  let trends: TrendingItem[] = [];
  let popular: PopularCard[] = [];
  let loading = true;
  let retrying = false;

  // 에러 상태
  let error: { type: ApiErrorType; message: string; retryable: boolean } | null = null;

  // 탭 상태: 'trend' | 'popular'
  let activeTab: 'trend' | 'popular' = 'trend';

  async function loadData() {
    loading = true;
    error = null;

    try {
      const [cardsRes, trendingRes, popularRes] = await Promise.all([
        listCards({ limit: 3, offset: 0 }),
        getTrending({ limit: 5 }),
        getPopularCards({ limit: 5 })
      ]);
      cards = cardsRes.items;
      trends = trendingRes.items;
      popular = popularRes.items;
    } catch (e) {
      console.error(e);
      if (e instanceof ApiError) {
        error = { type: e.type, message: e.message, retryable: e.retryable };
      } else {
        error = { type: 'UNKNOWN', message: '데이터를 불러오는데 실패했습니다.', retryable: true };
      }
    } finally {
      loading = false;
      retrying = false;
    }
  }

  async function handleRetry() {
    retrying = true;
    await loadData();
  }

  onMount(() => {
    const unsubscribe = isLoggedIn.subscribe(async (loggedIn) => {
      if (loggedIn) {
        await loadData();
        unsubscribe();
      }
    });

    return unsubscribe;
  });

  function getTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  }

  function getDisplayTitle(item: CardListItem | TrendingItem): string {
    return item.headline || item.issueTitle;
  }

  function getPopularDisplayTitle(item: PopularCard): string {
    return item.card.headline || item.card.issueTitle;
  }
</script>

{#if loading}
  <div class="loading">
    <div class="spinner"></div>
  </div>
{:else if error}
  <NetworkError
    errorType={error.type}
    message={error.message}
    retryable={error.retryable}
    loading={retrying}
    on:retry={handleRetry}
  />
{:else}
  <div class="home">
    <!-- 헤더 -->
    <header class="header">
      <h1 class="title">브리핑</h1>
      <p class="subtitle">오늘의 경제 뉴스</p>
    </header>

    <!-- 실시간 순위 -->
    <section class="section">
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

      <ul class="rank-list">
        {#if activeTab === 'trend'}
          {#each trends.slice(0, 3) as trend, i}
            <li>
              <a href="{base}/cards/{trend.issueId}" class="rank-item">
                <span class="rank" class:top={i === 0}>{i + 1}</span>
                <div class="rank-content">
                  <p class="rank-title">{getDisplayTitle(trend)}</p>
                  {#if trend.signalSummary}
                    <p class="rank-desc">{trend.signalSummary}</p>
                  {/if}
                </div>
                <span class="rank-meta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  {trend.articleCount}
                </span>
              </a>
            </li>
          {/each}
        {:else}
          {#each popular.slice(0, 3) as item, i}
            <li>
              <a href="{base}/cards/{item.card.issueId}" class="rank-item">
                <span class="rank" class:top={i === 0}>{i + 1}</span>
                <div class="rank-content">
                  <p class="rank-title">{getPopularDisplayTitle(item)}</p>
                  {#if item.card.signalSummary}
                    <p class="rank-desc">{item.card.signalSummary}</p>
                  {/if}
                </div>
                <span class="rank-meta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  </svg>
                  {formatViewCount(item.viewCount)}
                </span>
              </a>
            </li>
          {/each}
        {/if}
      </ul>

      <a href="{base}/trending" class="more-link">전체 보기</a>
    </section>

    <!-- 최신 브리핑 -->
    {#if cards.length > 0}
      <section class="section">
        <div class="section-header">
          <h2>최신 브리핑</h2>
          <a href="{base}/today" class="section-link">전체 보기</a>
        </div>

        <div class="cards">
          {#each cards as card}
            <a href="{base}/cards/{card.issueId}" class="card">
              <div class="card-header">
                <span class="card-category">{getGroupLabel(card.issueGroup)}</span>
                <span class="card-time">{getTimeAgo(card.issueLastPublishedAt)}</span>
              </div>
              <h3 class="card-title">{getDisplayTitle(card)}</h3>
              {#if card.signalSummary}
                <p class="card-highlight">{card.signalSummary}</p>
              {:else if card.conclusion}
                <p class="card-desc">{card.conclusion}</p>
              {/if}
              <div class="card-footer">
                <span>{card.articleCount}개 기사</span>
                {#if card.viewCount}
                  <span>·</span>
                  <span>{formatViewCount(card.viewCount)} 조회</span>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}
  </div>
{/if}

<style>
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2.5px solid var(--separator);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .home {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* 헤더 */
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

  /* 섹션 */
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .section-link {
    font-size: 15px;
    font-weight: 500;
    color: var(--accent);
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

  /* 순위 리스트 */
  .rank-list {
    background: var(--card);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .rank-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    border-bottom: 0.5px solid var(--separator);
    transition: background var(--duration-fast) var(--ease);
  }

  .rank-list li:last-child .rank-item {
    border-bottom: none;
  }

  .rank-item:active {
    background: var(--bg-tertiary);
  }

  .rank {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .rank.top {
    color: var(--accent);
  }

  .rank-content {
    flex: 1;
    min-width: 0;
  }

  .rank-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.4;
  }

  .rank-desc {
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 4px 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rank-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .more-link {
    font-size: 15px;
    font-weight: 500;
    color: var(--accent);
    text-align: center;
    padding: var(--space-2);
  }

  /* 카드 */
  .cards {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .card {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    transition: transform var(--duration) var(--ease);
  }

  .card:active {
    transform: scale(0.98);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .card-category {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
  }

  .card-time {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.5;
    margin: 0 0 var(--space-2);
    letter-spacing: -0.01em;
  }

  .card-highlight {
    font-size: 15px;
    color: var(--accent);
    line-height: 1.6;
    margin: 0 0 var(--space-3);
  }

  .card-desc {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 14px;
    color: var(--text-tertiary);
  }
</style>
