<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getMyBookmarks, removeBookmark } from "$lib/api";
  import type { BookmarkItem } from "$lib/types";
  import { isLoggedIn } from "$lib/stores/auth";
  import { getGroupLabel } from "$lib/utils/labels";

  let items: BookmarkItem[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const res = await getMyBookmarks();
      items = res.items;
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
    } finally {
      loading = false;
    }
  });

  async function handleRemove(issueId: number) {
    try {
      await removeBookmark(issueId);
      items = items.filter(item => item.issueId !== issueId);
    } catch (e) {
      console.error("북마크 삭제 실패:", e);
    }
  }

  function getDisplayTitle(item: BookmarkItem): string {
    return item.headline || item.issueTitle;
  }

</script>

<svelte:head>
  <title>저장됨 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="header">
    <h1 class="title">저장됨</h1>
    <p class="subtitle">저장한 브리핑</p>
  </header>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="error-box">
      <p>{error}</p>
      <button class="retry-btn" on:click={() => location.reload()}>다시 시도</button>
    </div>
  {:else if items.length === 0}
    <div class="empty-box">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/>
        </svg>
      </div>
      <p>저장한 브리핑이 없습니다</p>
      <a href="{base}/" class="browse-btn">브리핑 둘러보기</a>
    </div>
  {:else}
    <div class="list">
      {#each items as item}
        <div class="list-item">
          <a href="{base}/cards/{item.issueId}" class="item-content">
            <span class="item-category">{getGroupLabel(item.issueGroup)}</span>
            <h2 class="item-title">{getDisplayTitle(item)}</h2>
            {#if item.signalSummary}
              <p class="item-highlight">{item.signalSummary}</p>
            {:else if item.conclusion}
              <p class="item-desc">{item.conclusion}</p>
            {/if}
          </a>
          <button
            class="remove-btn"
            on:click={() => handleRemove(item.issueId)}
            aria-label="북마크 삭제"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/>
            </svg>
          </button>
        </div>
      {/each}
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
    margin: var(--space-2) 0 0;
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

  .error-box {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    text-align: center;
  }

  .error-box p {
    color: var(--text-secondary);
    font-size: 16px;
    margin: 0;
  }

  .retry-btn {
    margin-top: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: var(--accent);
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--radius);
  }

  .empty-box {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-7);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    color: var(--text-quaternary);
  }

  .empty-icon svg {
    width: 100%;
    height: 100%;
  }

  .empty-box p {
    color: var(--text-secondary);
    font-size: 17px;
    margin: 0;
  }

  .browse-btn {
    margin-top: var(--space-2);
    padding: var(--space-4) var(--space-5);
    background: var(--accent);
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--radius);
  }

  /* 리스트 */
  .list {
    background: var(--card);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .list-item {
    display: flex;
    border-bottom: 0.5px solid var(--separator);
    transition: background var(--duration-fast) var(--ease);
  }

  .list-item:last-child {
    border-bottom: none;
  }

  .item-content {
    flex: 1;
    padding: var(--space-5);
    min-width: 0;
  }

  .item-content:active {
    background: var(--bg-tertiary);
  }

  .item-category {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: var(--space-2);
  }

  .item-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.5;
    margin: 0 0 var(--space-2);
    letter-spacing: -0.01em;
  }

  .item-highlight {
    font-size: 15px;
    color: var(--accent);
    line-height: 1.6;
    margin: 0;
  }

  .item-desc {
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .remove-btn {
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    border-left: 0.5px solid var(--separator);
    transition: all var(--duration-fast) var(--ease);
  }

  .remove-btn:active {
    background: var(--bg-tertiary);
  }

  .remove-btn:hover {
    color: var(--system-red);
  }

  .remove-btn svg {
    width: 22px;
    height: 22px;
  }
</style>
