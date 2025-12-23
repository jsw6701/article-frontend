<script lang="ts">
  import { onMount } from "svelte";
  import { getCard } from "$lib/api";
  import type { CardDetail } from "$lib/types";
  import { getGroupLabel, formatRelativeTime } from "$lib/utils/labels";

  export let params: { issueId: string };

  let detail: CardDetail | null = null;
  let card: any = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      detail = await getCard(Number(params.issueId));
      const raw = detail.cardJson;
      card = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
    } finally {
      loading = false;
    }
  });

  function formatArticleDate(dateStr: string): string {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  }
</script>

{#if loading}
  <div class="status">
    <p>불러오는 중...</p>
  </div>
{:else if error}
  <div class="status">
    <p class="error">{error}</p>
  </div>
{:else if detail}
  <a class="back-link" href="/">← 목록으로</a>

  <header class="detail-header">
    <div class="detail-meta">
      <span class="detail-tag">{getGroupLabel(detail.issueGroup)}</span>
      <span class="detail-time">{formatRelativeTime(detail.issueLastPublishedAt)}</span>
      {#if detail.issueArticleCount > 0}
        <span class="detail-stats">기사 {detail.issueArticleCount}건 · {detail.issuePublisherCount}개 언론사</span>
      {/if}
    </div>
    <h1 class="detail-title">{detail.issueTitle}</h1>
  </header>

  <section class="section">
    <h2 class="section-label">결론</h2>
    <p class="section-text">{card?.conclusion ?? "-"}</p>
  </section>

  <section class="section">
    <h2 class="section-label">왜 중요한가</h2>
    <p class="section-text">{card?.why_it_matters ?? "-"}</p>
  </section>

  <section class="section">
    <h2 class="section-label">근거</h2>
    {#if card?.evidence?.length > 0}
      <ul class="evidence-list">
        {#each card.evidence as ev}
          <li class="evidence-item">
            <span class="evidence-source">{ev.source}</span>
            <span class="evidence-fact">{ev.fact}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="section-text muted">-</p>
    {/if}
  </section>

  <section class="section">
    <h2 class="section-label">반대 시나리오</h2>
    <p class="section-text">{card?.counter_scenario ?? "-"}</p>
  </section>

  <section class="section">
    <h2 class="section-label">영향도</h2>
    <div class="impact-row">
      <span class="impact-score">{card?.impact?.score ?? "-"}</span>
      <span class="impact-max">/ 5</span>
    </div>
    <p class="section-text">{card?.impact?.reason ?? "-"}</p>
  </section>

  <section class="section">
    <h2 class="section-label">행동 가이드</h2>
    <p class="section-text">{card?.action_guide ?? "-"}</p>
  </section>

  {#if detail.articles?.length > 0}
    <section class="section articles-section">
      <h2 class="section-label">관련 기사</h2>
      <ul class="articles-list">
        {#each detail.articles as article}
          <li class="article-item">
            <a class="article-link" href={article.link} target="_blank" rel="noopener noreferrer">
              <span class="article-title">{article.title}</span>
              <span class="article-meta">
                <span class="article-pub">{article.publisher}</span>
                <span class="article-date">{formatArticleDate(article.publishedAt)}</span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
{/if}

<style>
  .status {
    padding: var(--space-4);
    text-align: center;
  }

  .error {
    color: #dc2626;
    font-size: 14px;
  }

  .back-link {
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-sub);
    margin-bottom: var(--space-3);
    transition: color 0.15s;
  }

  .back-link:hover {
    color: var(--text-main);
  }

  .detail-header {
    margin-bottom: var(--space-4);
  }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .detail-tag {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .detail-time {
    font-size: 12px;
    color: var(--text-sub);
  }

  .detail-stats {
    font-size: 11px;
    color: var(--text-sub);
    margin-left: auto;
  }

  .detail-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.35;
    color: var(--text-main);
  }

  .section {
    background: var(--card);
    border-radius: var(--radius);
    padding: var(--space-4);
    box-shadow: var(--shadow);
    margin-bottom: var(--space-2);
  }

  .section-label {
    margin: 0 0 var(--space-2);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text-sub);
    text-transform: uppercase;
  }

  .section-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.65;
    color: var(--text-body);
  }

  .section-text.muted {
    color: var(--text-sub);
  }

  .evidence-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .evidence-item {
    padding: var(--space-2) 0;
  }

  .evidence-item:first-child {
    padding-top: 0;
  }

  .evidence-item:last-child {
    padding-bottom: 0;
  }

  .evidence-item + .evidence-item {
    border-top: 1px solid var(--border);
  }

  .evidence-source {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 4px;
  }

  .evidence-fact {
    display: block;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-body);
  }

  .impact-row {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: var(--space-2);
  }

  .impact-score {
    font-size: 32px;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
  }

  .impact-max {
    font-size: 14px;
    color: var(--text-sub);
  }

  /* 관련 기사 */
  .articles-section {
    margin-top: var(--space-4);
  }

  .articles-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .article-item + .article-item {
    border-top: 1px solid var(--border);
  }

  .article-link {
    display: block;
    padding: var(--space-2) 0;
    transition: opacity 0.15s;
  }

  .article-link:hover {
    opacity: 0.7;
  }

  .article-title {
    display: block;
    font-size: 14px;
    line-height: 1.45;
    color: var(--text-main);
    margin-bottom: 4px;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 12px;
  }

  .article-pub {
    color: var(--accent);
    font-weight: 500;
  }

  .article-date {
    color: var(--text-sub);
  }
</style>
