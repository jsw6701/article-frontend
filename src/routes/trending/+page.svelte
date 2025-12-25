<script lang="ts">
  import { base } from '$app/paths';
  import type { TrendingItem } from "$lib/types";
  import { getTrending } from "$lib/api";
  import { getGroupLabel } from "$lib/utils/labels";

  let items: TrendingItem[] = [];
  let loading = true;
  let error: string | null = null;

  (async () => {
    try {
      const res = await getTrending({ limit: 10 });
      items = res.items;
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
    } finally {
      loading = false;
    }
  })();

  function getDisplayTitle(item: TrendingItem): string {
    return item.headline || item.issueTitle;
  }
</script>

<div class="page">
  <header class="page-header">
    <h1>트렌딩</h1>
    <p>가장 많이 보도된 이슈</p>
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
      <p>트렌딩 이슈가 없습니다</p>
    </div>
  {:else}
    <div class="list">
      {#each items as item, i}
        <a href="{base}/cards/{item.issueId}" class="item">
          <div class="rank" class:top={i < 3}>{i + 1}</div>
          <div class="content">
            <span class="cat">{getGroupLabel(item.issueGroup)}</span>
            <h2 class="title">{getDisplayTitle(item)}</h2>
            {#if item.signalSummary}
              <p class="signal">{item.signalSummary}</p>
            {:else if item.conclusion}
              <p class="desc">{item.conclusion}</p>
            {/if}
            <div class="stats">
              <span>{item.articleCount}개 기사</span>
              <span>·</span>
              <span>{item.publisherCount}개 매체</span>
            </div>
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

  .signal {
    font-size: 13px;
    color: var(--accent);
    line-height: 1.5;
    margin: 0 0 var(--space-2);
  }

  .desc {
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
    font-size: 12px;
    color: var(--text-sub);
    display: flex;
    gap: var(--space-1);
  }
</style>
