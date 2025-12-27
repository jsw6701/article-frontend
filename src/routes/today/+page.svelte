<script lang="ts">
  import { base } from '$app/paths';
  import { onMount, onDestroy } from 'svelte';
  import type { CardListItem } from "$lib/types";
  import { listCards } from "$lib/api";
  import { getGroupLabel, formatViewCount } from "$lib/utils/labels";
  import { isLoggedIn } from "$lib/stores/auth";

  let items: CardListItem[] = [];
  let loading = true;
  let loadingMore = false;
  let error: string | null = null;
  let hasMore = true;
  let offset = 0;
  const LIMIT = 10;

  let sentinel: HTMLDivElement;
  let observer: IntersectionObserver | null = null;

  async function loadCards(isInitial = false) {
    if (loadingMore || (!isInitial && !hasMore)) return;

    if (isInitial) {
      loading = true;
      offset = 0;
      items = [];
    } else {
      loadingMore = true;
    }

    try {
      const res = await listCards({ limit: LIMIT, offset });
      if (isInitial) {
        items = res.items;
      } else {
        items = [...items, ...res.items];
      }
      offset += res.items.length;
      hasMore = res.items.length === LIMIT;
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
    } finally {
      loading = false;
      loadingMore = false;
    }
  }

  onMount(() => {
    const unsubscribe = isLoggedIn.subscribe(async (loggedIn) => {
      if (loggedIn) {
        await loadCards(true);

        // IntersectionObserver 설정
        observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
              loadCards();
            }
          },
          { rootMargin: '100px' }
        );

        if (sentinel) {
          observer.observe(sentinel);
        }

        unsubscribe();
      }
    });
    return unsubscribe;
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  function getTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  }

  function getDisplayTitle(item: CardListItem): string {
    return item.headline || item.issueTitle;
  }
</script>

<div class="page">
  <header class="page-header">
    <h1>전체 브리핑</h1>
    <p>모든 브리핑 카드</p>
  </header>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={() => location.reload()}>다시 시도</button>
    </div>
  {:else if items.length === 0}
    <div class="empty">
      <p>브리핑 카드가 없습니다</p>
    </div>
  {:else}
    <div class="list">
      {#each items as item}
        <a href="{base}/cards/{item.issueId}" class="item">
          <div class="item-header">
            <span class="item-cat">{getGroupLabel(item.issueGroup)}</span>
            <span class="item-time">{getTimeAgo(item.issueLastPublishedAt)}</span>
          </div>
          <h2 class="item-title">{getDisplayTitle(item)}</h2>
          {#if item.signalSummary}
            <p class="item-signal">{item.signalSummary}</p>
          {:else if item.conclusion}
            <p class="item-desc">{item.conclusion}</p>
          {/if}
          <div class="item-footer">
            <span>{item.articleCount}개 기사</span>
            {#if item.viewCount}
              <span class="item-views">{formatViewCount(item.viewCount)} 조회</span>
            {/if}
          </div>
        </a>
      {/each}
    </div>

    <!-- 무한 스크롤 감지용 sentinel -->
    <div bind:this={sentinel} class="sentinel">
      {#if loadingMore}
        <div class="loading-more">
          <div class="spinner"></div>
        </div>
      {:else if !hasMore}
        <p class="end-message">모든 브리핑을 불러왔습니다</p>
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
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    transition: border-color 0.15s;
  }

  .item:hover {
    border-color: var(--border-light);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .item-cat {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .item-time {
    font-size: 12px;
    color: var(--text-sub);
  }

  .item-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    line-height: 1.4;
    margin: 0 0 var(--space-2);
  }

  .item:hover .item-title {
    color: var(--accent);
  }

  .item-signal {
    font-size: 13px;
    color: var(--accent);
    line-height: 1.5;
    margin: 0 0 var(--space-3);
  }

  .item-desc {
    font-size: 13px;
    color: var(--text-body);
    line-height: 1.5;
    margin: 0 0 var(--space-3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-footer {
    font-size: 12px;
    color: var(--text-sub);
    display: flex;
    gap: var(--space-2);
  }

  .item-views::before {
    content: "·";
    margin-right: var(--space-2);
  }

  .sentinel {
    padding: var(--space-4) 0;
    min-height: 60px;
  }

  .loading-more {
    display: flex;
    justify-content: center;
  }

  .end-message {
    text-align: center;
    font-size: 13px;
    color: var(--text-sub);
    margin: 0;
  }
</style>
