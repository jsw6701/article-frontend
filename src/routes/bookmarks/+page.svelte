<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getMyBookmarks, removeBookmark } from "$lib/api";
  import type { BookmarkItem } from "$lib/types";
  import { isLoggedIn, currentUser } from "$lib/stores/auth";
  import { getGroupLabel } from "$lib/utils/labels";

  let items: BookmarkItem[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    // 로그인 체크
    if (!$isLoggedIn || !$currentUser) {
      goto(`${base}/login`);
      return;
    }

    try {
      const res = await getMyBookmarks($currentUser.accessToken);
      items = res.items;
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
    } finally {
      loading = false;
    }
  });

  async function handleRemove(issueId: number) {
    if (!$currentUser) return;

    try {
      await removeBookmark(issueId, $currentUser.accessToken);
      items = items.filter(item => item.issueId !== issueId);
    } catch (e) {
      console.error("북마크 삭제 실패:", e);
    }
  }

  function getDisplayTitle(item: BookmarkItem): string {
    return item.headline || item.issueTitle;
  }

</script>

<div class="page">
  <header class="page-header">
    <h1>북마크</h1>
    <p>저장한 브리핑</p>
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
      <p>저장한 브리핑이 없습니다</p>
      <a href="{base}/">브리핑 둘러보기</a>
    </div>
  {:else}
    <div class="list">
      {#each items as item}
        <div class="item">
          <a href="{base}/cards/{item.issueId}" class="item-content">
            <span class="item-cat">{getGroupLabel(item.issueGroup)}</span>
            <h2 class="item-title">{getDisplayTitle(item)}</h2>
            {#if item.signalSummary}
              <p class="item-signal">{item.signalSummary}</p>
            {:else if item.conclusion}
              <p class="item-desc">{item.conclusion}</p>
            {/if}
          </a>
          <button
            class="remove-btn"
            on:click={() => handleRemove(item.issueId)}
            aria-label="북마크 삭제"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
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

  .error button, .empty a {
    display: inline-block;
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
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color 0.15s;
  }

  .item:hover {
    border-color: var(--border-light);
  }

  .item-content {
    flex: 1;
    padding: var(--space-4);
    min-width: 0;
  }

  .item-cat {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: var(--space-2);
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
    margin: 0;
  }

  .item-desc {
    font-size: 13px;
    color: var(--text-body);
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .remove-btn {
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    border-left: 1px solid var(--border);
    transition: all 0.15s;
  }

  .remove-btn:hover {
    background: var(--card-hover);
    color: var(--accent-red);
  }

  .remove-btn svg {
    width: 18px;
    height: 18px;
  }
</style>
