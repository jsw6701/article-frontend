<script lang="ts">
  import { base } from '$app/paths';
  import type { CardListItem } from "$lib/types";
  import { todayCards } from "$lib/api";
  import { getGroupLabel } from "$lib/utils/labels";

  let items: CardListItem[] = [];
  let loading = true;
  let error: string | null = null;

  (async () => {
    try {
      const res = await todayCards(20);
      items = res.items;
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
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

  function getDisplayTitle(item: CardListItem): string {
    return item.headline || item.issueTitle;
  }
</script>

<div class="page">
  <header class="page-header">
    <h1>피드</h1>
    <p>최근 7일간 업데이트</p>
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
      <p>최근 업데이트가 없습니다</p>
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
          </div>
        </a>
      {/each}
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
  }
</style>
