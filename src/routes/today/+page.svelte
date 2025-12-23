<script lang="ts">
  import { base } from '$app/paths';
  import type { CardListItem } from "$lib/types";
  import { todayCards } from "$lib/api";
  import { getGroupLabel, formatRelativeTime } from "$lib/utils/labels";

  let items: CardListItem[] = [];
  let loading = true;
  let error: string | null = null;

  (async () => {
    try {
      const res = await todayCards(7);
      items = res.items;
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
    } finally {
      loading = false;
    }
  })();
</script>

<header class="page-header">
  <h1 class="page-title">오늘의 브리핑</h1>
  <p class="page-desc">최근 7일간 업데이트</p>
</header>

{#if loading}
  <div class="status">
    <p>불러오는 중...</p>
  </div>
{:else if error}
  <div class="status">
    <p class="error">{error}</p>
  </div>
{:else if items.length === 0}
  <div class="status">
    <p class="muted">최근 업데이트가 없습니다</p>
  </div>
{:else}
  <section class="list">
    {#each items as it}
      <a class={`card group-${it.issueGroup.toLowerCase()}`} href={`${base}/cards/${it.issueId}`}>
        <div class="card-meta">
          <span class="card-tag">{getGroupLabel(it.issueGroup)}</span>
          <span class="card-time">{formatRelativeTime(it.issueLastPublishedAt)}</span>
          {#if it.articleCount > 0}
            <span class="card-stats">기사 {it.articleCount}건 · {it.publisherCount}개 언론사</span>
          {/if}
        </div>
        <h3 class="card-title">{it.issueTitle}</h3>
        <p class="card-desc">{it.conclusion ?? "내용을 불러오는 중..."}</p>
      </a>
    {/each}
  </section>
{/if}

<style>
  .page-header {
    margin-bottom: var(--space-4);
  }

  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-main);
  }

  .page-desc {
    margin: var(--space-1) 0 0;
    font-size: 14px;
    color: var(--text-sub);
  }

  .status {
    padding: var(--space-4);
    text-align: center;
  }

  .error {
    color: #dc2626;
    font-size: 14px;
  }

  .muted {
    color: var(--text-sub);
    font-size: 14px;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .card {
    display: block;
    background: var(--card);
    border-radius: var(--radius);
    padding: var(--space-3) var(--space-4);
    box-shadow: var(--shadow);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  @media (hover: hover) {
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.06);
    }
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }

  .card-tag {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .card-time {
    font-size: 12px;
    color: var(--text-sub);
  }

  .card-stats {
    font-size: 11px;
    color: var(--text-sub);
    margin-left: auto;
  }

  .card-title {
    margin: 0 0 var(--space-1);
    font-size: 16px;
    font-weight: 650;
    line-height: 1.4;
    color: var(--text-main);
  }

  .card-desc {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-body);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 그룹별 태그 컬러 */
  :global(.group-rate) .card-tag { color: var(--g-rate); }
  :global(.group-fx) .card-tag { color: var(--g-fx); }
  :global(.group-stock) .card-tag { color: var(--g-stock); }
  :global(.group-realestate) .card-tag { color: var(--g-realestate); }
  :global(.group-macro) .card-tag { color: var(--g-macro); }
  :global(.group-policy) .card-tag { color: var(--g-policy); }
</style>
