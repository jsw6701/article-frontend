<script lang="ts">
  import type { CardListItem, IssueGroup } from "$lib/types";
  import { listCards } from "$lib/api";
  import TodayBriefing from "$lib/components/TodayBriefing.svelte";
  import { getGroupLabel, formatRelativeTime } from "$lib/utils/labels";

  const groups: { label: string; value?: IssueGroup }[] = [
    { label: "전체", value: undefined },
    { label: "금리", value: "RATE" },
    { label: "환율", value: "FX" },
    { label: "주식", value: "STOCK" },
    { label: "부동산", value: "REALESTATE" },
    { label: "거시경제", value: "MACRO" },
    { label: "정책", value: "POLICY" }
  ];

  let group: IssueGroup | undefined = undefined;
  let items: CardListItem[] = [];
  let loading = false;
  let error: string | null = null;

  let limit = 20;
  let offset = 0;
  let hasMore = true;

  async function load(reset = false) {
    if (loading) return;
    loading = true;
    error = null;

    try {
      if (reset) {
        items = [];
        offset = 0;
        hasMore = true;
      }

      const res = await listCards({ group, limit, offset });
      items = [...items, ...res.items];
      offset += res.items.length;
      hasMore = res.items.length === limit;
    } catch (e: any) {
      error = e?.message ?? "Failed to load";
    } finally {
      loading = false;
    }
  }

  load(true);

  function onChangeGroup(v?: IssueGroup) {
    group = v;
    load(true);
  }
</script>

<TodayBriefing />

<section class="filter">
  {#each groups as g}
    <button
      class="filter-chip"
      class:active={g.value === group}
      on:click={() => onChangeGroup(g.value)}
    >
      {g.label}
    </button>
  {/each}
</section>

{#if error}
  <p class="error">{error}</p>
{/if}

<section class="list">
  {#each items as it}
    <a class={`card group-${it.issueGroup.toLowerCase()}`} href={`/cards/${it.issueId}`}>
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

{#if hasMore}
  <div class="load-more">
    <button class="load-btn" disabled={loading} on:click={() => load(false)}>
      {loading ? "불러오는 중..." : "더 보기"}
    </button>
  </div>
{/if}

<style>
  .filter {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-bottom: var(--space-4);
  }

  .filter-chip {
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    border-radius: 999px;
    background: var(--card);
    color: var(--text-sub);
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: var(--shadow);
  }

  .filter-chip:hover {
    color: var(--text-body);
  }

  .filter-chip.active {
    background: var(--text-main);
    color: #fff;
  }

  .error {
    color: #dc2626;
    font-size: 14px;
    margin-bottom: var(--space-3);
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

  .load-more {
    margin-top: var(--space-4);
    text-align: center;
  }

  .load-btn {
    padding: var(--space-2) var(--space-4);
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: var(--radius);
    background: var(--card);
    color: var(--text-body);
    cursor: pointer;
    box-shadow: var(--shadow);
    transition: all 0.15s;
  }

  .load-btn:hover:not(:disabled) {
    background: var(--text-main);
    color: #fff;
  }

  .load-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 그룹별 태그 컬러 */
  :global(.group-rate) .card-tag { color: var(--g-rate); }
  :global(.group-fx) .card-tag { color: var(--g-fx); }
  :global(.group-stock) .card-tag { color: var(--g-stock); }
  :global(.group-realestate) .card-tag { color: var(--g-realestate); }
  :global(.group-macro) .card-tag { color: var(--g-macro); }
  :global(.group-policy) .card-tag { color: var(--g-policy); }
</style>
