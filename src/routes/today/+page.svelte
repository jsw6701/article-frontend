<script lang="ts">
  import { base } from '$app/paths';
  import { onMount, onDestroy } from 'svelte';
  import type { CardListItem } from "$lib/types";
  import { listCards } from "$lib/api";
  import { getGroupLabel, formatViewCount } from "$lib/utils/labels";
  import { isLoggedIn } from "$lib/stores/auth";
  import LifecycleBadge from "$lib/components/LifecycleBadge.svelte";

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

<svelte:head>
  <title>피드 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="header">
    <h1 class="title">피드</h1>
    <p class="subtitle">모든 브리핑 카드</p>
  </header>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="message-box">
      <p>{error}</p>
      <button class="action-btn" on:click={() => location.reload()}>다시 시도</button>
    </div>
  {:else if items.length === 0}
    <div class="message-box">
      <p>브리핑 카드가 없습니다</p>
    </div>
  {:else}
    <div class="cards">
      {#each items as item}
        <a href="{base}/cards/{item.issueId}" class="card">
          <div class="card-header">
            <div class="card-meta">
              <span class="card-category">{getGroupLabel(item.issueGroup)}</span>
              {#if item.lifecycle}
                <LifecycleBadge lifecycle={item.lifecycle} showChange={true} />
              {/if}
            </div>
            <span class="card-time">{getTimeAgo(item.issueLastPublishedAt)}</span>
          </div>
          <h2 class="card-title">{getDisplayTitle(item)}</h2>
          {#if item.signalSummary}
            <p class="card-highlight">{item.signalSummary}</p>
          {:else if item.conclusion}
            <p class="card-desc">{item.conclusion}</p>
          {/if}
          <div class="card-footer">
            <span>{item.articleCount}개 기사</span>
            {#if item.viewCount}
              <span>·</span>
              <span>{formatViewCount(item.viewCount)} 조회</span>
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

  .card-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
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

  .sentinel {
    padding: var(--space-5) 0;
    min-height: 60px;
  }

  .loading-more {
    display: flex;
    justify-content: center;
  }

  .end-message {
    text-align: center;
    font-size: 14px;
    color: var(--text-tertiary);
    margin: 0;
  }
</style>
