<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import type { CardListItem, TrendingItem, PopularCard } from "$lib/types";
  import { listCards, getTrending, getPopularCards } from "$lib/api";
  import { getGroupLabel, formatViewCount } from "$lib/utils/labels";
  import { isLoggedIn } from "$lib/stores/auth";

  let cards: CardListItem[] = [];
  let trends: TrendingItem[] = [];
  let popular: PopularCard[] = [];
  let loading = true;

  // 탭 상태: 'trend' | 'popular'
  let activeTab: 'trend' | 'popular' = 'trend';

  onMount(() => {
    // 로그인 상태가 확인된 후 API 호출
    const unsubscribe = isLoggedIn.subscribe(async (loggedIn) => {
      if (loggedIn) {
        try {
          const [cardsRes, trendingRes, popularRes] = await Promise.all([
            listCards({ limit: 6, offset: 0 }),
            getTrending({ limit: 5 }),
            getPopularCards({ limit: 5 })
          ]);
          cards = cardsRes.items;
          trends = trendingRes.items;
          popular = popularRes.items;
        } catch (e) {
          console.error(e);
        } finally {
          loading = false;
        }
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

  // headline이 있으면 headline, 없으면 issueTitle 사용
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
{:else}
  <div class="home">
    <!-- 인사 헤더 -->
    <div class="greeting">
      <p class="greeting-sub">오늘의 경제</p>
      <h1 class="greeting-main">브리핑</h1>
    </div>

    <!-- 화제 & 조회수 순위 (탭 전환) -->
    <section class="section">
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
        <a href="{base}/trending" class="tab-more">더보기</a>
      </div>

      <div class="tab-content">
        {#if activeTab === 'trend'}
          <div class="rank-list">
            {#each trends.slice(0, 3) as trend, i}
              <a href="{base}/cards/{trend.issueId}" class="rank-item">
                <span class="rank-num" class:top={i < 3}>{i + 1}</span>
                <div class="rank-content">
                  <span class="rank-title">{getDisplayTitle(trend)}</span>
                  {#if trend.signalSummary}
                    <span class="rank-sub">{trend.signalSummary}</span>
                  {/if}
                </div>
                <span class="rank-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  {trend.articleCount}
                </span>
              </a>
            {/each}
          </div>
        {:else}
          <div class="rank-list">
            {#each popular.slice(0, 3) as item, i}
              <a href="{base}/cards/{item.card.issueId}" class="rank-item">
                <span class="rank-num" class:top={i < 3}>{i + 1}</span>
                <div class="rank-content">
                  <span class="rank-title">{getPopularDisplayTitle(item)}</span>
                  {#if item.card.signalSummary}
                    <span class="rank-sub">{item.card.signalSummary}</span>
                  {/if}
                </div>
                <span class="rank-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {formatViewCount(item.viewCount)}
                </span>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <!-- 최신 브리핑 -->
    {#if cards.length > 0}
      <section class="section">
        <div class="section-head">
          <h2>최신 브리핑</h2>
          <a href="{base}/today">더보기</a>
        </div>
        <div class="card-list">
          {#each cards as card}
            <a href="{base}/cards/{card.issueId}" class="card">
              <div class="card-top">
                <span class="card-cat">{getGroupLabel(card.issueGroup)}</span>
                <span class="card-time">{getTimeAgo(card.issueLastPublishedAt)}</span>
              </div>
              <h3 class="card-title">{getDisplayTitle(card)}</h3>
              {#if card.signalSummary}
                <p class="card-summary">{card.signalSummary}</p>
              {:else if card.conclusion}
                <p class="card-desc">{card.conclusion}</p>
              {/if}
              <div class="card-bottom">
                <span class="card-articles">{card.articleCount}개 기사</span>
                {#if card.viewCount}
                  <span class="card-views">{formatViewCount(card.viewCount)} 조회</span>
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
    min-height: 50vh;
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

  .home {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* 인사 */
  .greeting {
    padding: var(--space-2) 0;
  }

  .greeting-sub {
    font-size: 13px;
    color: var(--text-sub);
    margin: 0 0 4px;
  }

  .greeting-main {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
  }

  /* 섹션 */
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-head h2 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0;
  }

  .section-head a {
    font-size: 13px;
    color: var(--text-sub);
  }

  .section-head a:hover {
    color: var(--accent);
  }

  /* 탭 헤더 */
  .tab-header {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-bottom: var(--space-3);
  }

  .tab-btn {
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
    background: var(--card);
  }

  .tab-more {
    margin-left: auto;
    font-size: 13px;
    color: var(--text-sub);
  }

  .tab-more:hover {
    color: var(--accent);
  }

  /* 랭킹 리스트 (공통) */
  .rank-list {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .rank-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  .rank-item:last-child {
    border-bottom: none;
  }

  .rank-item:hover {
    background: var(--card-hover);
  }

  .rank-num {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-sub);
    background: var(--card-hover);
    border-radius: var(--radius);
    flex-shrink: 0;
  }

  .rank-num.top {
    color: white;
    background: var(--accent);
  }

  .rank-content {
    flex: 1;
    min-width: 0;
  }

  .rank-title {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rank-sub {
    display: block;
    font-size: 12px;
    color: var(--text-sub);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rank-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-sub);
    background: var(--card-hover);
    padding: 4px 10px;
    border-radius: var(--radius);
    flex-shrink: 0;
  }

  .rank-badge svg {
    width: 12px;
    height: 12px;
  }

  /* 카드 리스트 */
  .card-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    transition: all 0.15s;
  }

  .card:hover {
    border-color: var(--border-light);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .card-cat {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .card-time {
    font-size: 12px;
    color: var(--text-sub);
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    line-height: 1.4;
    margin: 0 0 var(--space-2);
  }

  .card:hover .card-title {
    color: var(--accent);
  }

  .card-summary {
    font-size: 13px;
    color: var(--accent);
    line-height: 1.5;
    margin: 0 0 var(--space-3);
  }

  .card-desc {
    font-size: 13px;
    color: var(--text-body);
    line-height: 1.5;
    margin: 0 0 var(--space-3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-bottom {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .card-articles {
    font-size: 12px;
    color: var(--text-sub);
  }

  .card-views {
    font-size: 12px;
    color: var(--text-sub);
  }

  .card-views::before {
    content: "·";
    margin-right: var(--space-2);
  }
</style>
