<script lang="ts">
  import { base } from '$app/paths';
  import type { CardListItem, TrendingItem } from "$lib/types";
  import { listCards, getTrending } from "$lib/api";
  import { getGroupLabel } from "$lib/utils/labels";

  let cards: CardListItem[] = [];
  let trends: TrendingItem[] = [];
  let loading = true;

  (async () => {
    try {
      const [cardsRes, trendingRes] = await Promise.all([
        listCards({ limit: 6, offset: 0 }),
        getTrending({ limit: 5 })
      ]);
      cards = cardsRes.items;
      trends = trendingRes.items;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  })();

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

    <!-- 트렌딩 섹션 -->
    {#if trends.length > 0}
      <section class="section">
        <div class="section-head">
          <h2>실시간 트렌드</h2>
          <a href="{base}/trending">더보기</a>
        </div>
        <div class="trend-list">
          {#each trends.slice(0, 5) as trend, i}
            <a href="{base}/cards/{trend.issueId}" class="trend-item">
              <span class="trend-rank" class:top={i < 3}>{i + 1}</span>
              <div class="trend-content">
                <span class="trend-title">{getDisplayTitle(trend)}</span>
                {#if trend.signalSummary}
                  <span class="trend-summary">{trend.signalSummary}</span>
                {/if}
              </div>
              <span class="trend-count">{trend.articleCount}</span>
            </a>
          {/each}
        </div>
      </section>
    {/if}

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

  /* 트렌드 */
  .trend-list {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .trend-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  .trend-item:last-child {
    border-bottom: none;
  }

  .trend-item:hover {
    background: var(--card-hover);
  }

  .trend-rank {
    width: 20px;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-sub);
    flex-shrink: 0;
  }

  .trend-rank.top {
    color: var(--accent);
  }

  .trend-content {
    flex: 1;
    min-width: 0;
  }

  .trend-title {
    display: block;
    font-size: 14px;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trend-summary {
    display: block;
    font-size: 12px;
    color: var(--text-sub);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trend-count {
    font-size: 12px;
    color: var(--text-sub);
    background: var(--card-hover);
    padding: 2px 8px;
    border-radius: var(--radius);
    flex-shrink: 0;
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
  }

  .card-articles {
    font-size: 12px;
    color: var(--text-sub);
  }
</style>
