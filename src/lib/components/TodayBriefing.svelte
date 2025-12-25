<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from "svelte";
  import { todayCards } from "$lib/api";
  import type { CardListItem } from "$lib/types";
  import { getGroupLabel, formatRelativeTime } from "$lib/utils/labels";

  let item: CardListItem | null = null;
  let loading = true;

  onMount(async () => {
    try {
      const page = await todayCards(1);
      item = page.items[0] ?? null;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <section class="hero-skeleton">
    <div class="skel-label"></div>
    <div class="skel-title"></div>
    <div class="skel-text"></div>
  </section>
{:else if item}
  <a class={`today-brief group-${item.issueGroup.toLowerCase()}`} href={`${base}/cards/${item.issueId}`}>
    <div class="brief-bar"></div>
    <div class="brief-content">
      <div class="brief-label">오늘의 브리핑</div>
      <p class="brief-headline">{item.conclusion}</p>
      <div class="brief-meta">
        <span class="brief-tag">{getGroupLabel(item.issueGroup)}</span>
        <span class="brief-time">{formatRelativeTime(item.cardUpdatedAt)}</span>
      </div>
    </div>
  </a>
{/if}

<style>
  /* Skeleton */
  .hero-skeleton {
    padding: var(--space-4);
    background: var(--card);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-4);
    border: 1px solid var(--border);
  }

  .skel-label {
    width: 100px;
    height: 16px;
    background: linear-gradient(90deg, var(--border) 25%, var(--card-hover) 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius);
    margin-bottom: var(--space-2);
  }

  .skel-title {
    width: 85%;
    height: 24px;
    background: linear-gradient(90deg, var(--border) 25%, var(--card-hover) 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius);
    margin-bottom: var(--space-2);
  }

  .skel-text {
    width: 60%;
    height: 16px;
    background: linear-gradient(90deg, var(--border) 25%, var(--card-hover) 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius);
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Today Brief Card */
  .today-brief {
    position: relative;
    display: flex;
    background: var(--card);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-4);
    overflow: hidden;
    border: 1px solid var(--border);
    transition: all 0.2s var(--ease);
  }

  .today-brief:hover {
    border-color: var(--border-light);
    transform: translateY(-2px);
  }

  .brief-bar {
    width: 4px;
    flex-shrink: 0;
    background: var(--accent);
  }

  .brief-content {
    flex: 1;
    padding: var(--space-4);
  }

  .brief-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--text-sub);
    text-transform: uppercase;
    margin-bottom: var(--space-2);
  }

  .brief-headline {
    font-size: 16px;
    line-height: 1.55;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 var(--space-3);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .brief-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .brief-tag {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .brief-time {
    font-size: 12px;
    color: var(--text-sub);
  }

  /* 그룹별 바 컬러 */
  :global(.today-brief.group-rate) .brief-bar { background: var(--g-rate); }
  :global(.today-brief.group-rate) .brief-tag { color: var(--g-rate); }

  :global(.today-brief.group-fx) .brief-bar { background: var(--g-fx); }
  :global(.today-brief.group-fx) .brief-tag { color: var(--g-fx); }

  :global(.today-brief.group-stock) .brief-bar { background: var(--g-stock); }
  :global(.today-brief.group-stock) .brief-tag { color: var(--g-stock); }

  :global(.today-brief.group-realestate) .brief-bar { background: var(--g-realestate); }
  :global(.today-brief.group-realestate) .brief-tag { color: var(--g-realestate); }

  :global(.today-brief.group-macro) .brief-bar { background: var(--g-macro); }
  :global(.today-brief.group-macro) .brief-tag { color: var(--g-macro); }

  :global(.today-brief.group-policy) .brief-bar { background: var(--g-policy); }
  :global(.today-brief.group-policy) .brief-tag { color: var(--g-policy); }
</style>
