<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from "svelte";
  import { getCard, getBookmarkStatus, addBookmark, removeBookmark } from "$lib/api";
  import type { CardDetail } from "$lib/types";
  import { getGroupLabel, formatRelativeTime, formatViewCount } from "$lib/utils/labels";
  import { isLoggedIn, currentUser } from "$lib/stores/auth";

  export let params: { issueId: string };

  let detail: CardDetail | null = null;
  let card: any = null;
  let loading = true;
  let error: string | null = null;

  // 북마크 상태
  let isBookmarked = false;
  let bookmarkLoading = false;

  onMount(async () => {
    try {
      detail = await getCard(Number(params.issueId));
      const raw = detail.cardJson;
      card = typeof raw === "string" ? JSON.parse(raw) : raw;

      // 로그인된 경우 북마크 상태 확인
      if ($isLoggedIn && $currentUser) {
        try {
          const status = await getBookmarkStatus(Number(params.issueId), $currentUser.accessToken);
          isBookmarked = status.bookmarked;
        } catch {
          // 북마크 상태 조회 실패는 무시
        }
      }
    } catch (e: any) {
      error = e?.message ?? "불러오기 실패";
    } finally {
      loading = false;
    }
  });

  async function toggleBookmark() {
    if (!$isLoggedIn || !$currentUser) return;

    bookmarkLoading = true;
    try {
      if (isBookmarked) {
        await removeBookmark(Number(params.issueId), $currentUser.accessToken);
        isBookmarked = false;
      } else {
        await addBookmark(Number(params.issueId), $currentUser.accessToken);
        isBookmarked = true;
      }
    } catch (e) {
      console.error("북마크 처리 실패:", e);
    } finally {
      bookmarkLoading = false;
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  function getDisplayTitle(item: CardDetail): string {
    return item.headline || item.issueTitle;
  }
</script>

{#if loading}
  <div class="loading">
    <div class="spinner"></div>
  </div>
{:else if error}
  <div class="error">
    <p>{error}</p>
    <a href="{base}/">홈으로 돌아가기</a>
  </div>
{:else if detail && card}
  <article class="article">
    <!-- 뒤로가기 -->
    <a class="back" href="{base}/">← 뒤로</a>

    <!-- 메인 헤더 -->
    <header class="header">
      <div class="header-top">
        <span class="cat">{getGroupLabel(detail.issueGroup)}</span>
        {#if $isLoggedIn}
          <button
            class="bookmark-btn"
            class:active={isBookmarked}
            on:click={toggleBookmark}
            disabled={bookmarkLoading}
            aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
          >
            <svg viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        {/if}
      </div>
      <h1 class="title">{getDisplayTitle(detail)}</h1>
      {#if detail.signalSummary}
        <p class="signal">{detail.signalSummary}</p>
      {/if}
      <div class="meta">
        <span>{formatRelativeTime(detail.issueLastPublishedAt)}</span>
        <span>·</span>
        <span>{detail.issueArticleCount}개 기사</span>
        <span>·</span>
        <span>{detail.issuePublisherCount}개 매체</span>
        {#if detail.viewCount}
          <span>·</span>
          <span>{formatViewCount(detail.viewCount)} 조회</span>
        {/if}
      </div>
    </header>

    <!-- 핵심 결론 -->
    <section class="section highlight">
      <h2>핵심 요약</h2>
      <p class="lead">{card.conclusion}</p>
    </section>

    <!-- 왜 중요한가 -->
    <section class="section">
      <h2>왜 중요한가</h2>
      <p>{card.why_it_matters}</p>
    </section>

    <!-- 근거 -->
    {#if card.evidence?.length > 0}
      <section class="section">
        <h2>근거</h2>
        <ul class="evidence">
          {#each card.evidence as ev}
            <li>
              <span class="ev-source">{ev.source}</span>
              <span class="ev-fact">{ev.fact}</span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- 반대 시나리오 -->
    <section class="section">
      <h2>반대 시나리오</h2>
      <p>{card.counter_scenario}</p>
    </section>

    <!-- 영향도 -->
    <section class="section">
      <h2>영향도</h2>
      <div class="impact">
        <div class="impact-score">
          <span class="score-num">{card.impact?.score ?? '-'}</span>
          <span class="score-max">/5</span>
        </div>
        <div class="impact-bar">
          <div class="impact-fill" style="width: {((card.impact?.score ?? 0) / 5) * 100}%"></div>
        </div>
        <p class="impact-reason">{card.impact?.reason}</p>
      </div>
    </section>

    <!-- 행동 가이드 -->
    <section class="section action">
      <h2>행동 가이드</h2>
      <p>{card.action_guide}</p>
    </section>

    <!-- 관련 기사 -->
    {#if detail.articles?.length > 0}
      <section class="section">
        <h2>관련 기사 ({detail.articles.length})</h2>
        <ul class="articles">
          {#each detail.articles as article}
            <li>
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                <span class="art-title">{article.title}</span>
                <span class="art-meta">
                  {article.publisher} · {formatDate(article.publishedAt)}
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </article>
{/if}

<style>
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

  .error {
    text-align: center;
    padding: var(--space-6) 0;
    color: var(--text-sub);
  }

  .error a {
    display: inline-block;
    margin-top: var(--space-3);
    color: var(--accent);
  }

  .article {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .back {
    font-size: 13px;
    color: var(--text-sub);
  }

  .back:hover {
    color: var(--accent);
  }

  /* 헤더 */
  .header {
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border);
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cat {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .bookmark-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-sub);
    border-radius: var(--radius);
    transition: all 0.2s var(--ease);
  }

  .bookmark-btn:hover {
    color: var(--accent);
    background: var(--card-hover);
  }

  .bookmark-btn.active {
    color: var(--accent);
  }

  .bookmark-btn:disabled {
    opacity: 0.5;
  }

  .bookmark-btn svg {
    width: 20px;
    height: 20px;
  }

  .title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.3;
    margin: var(--space-2) 0;
  }

  .signal {
    font-size: 15px;
    color: var(--accent);
    line-height: 1.5;
    margin: 0 0 var(--space-2);
  }

  .meta {
    font-size: 13px;
    color: var(--text-sub);
    display: flex;
    gap: var(--space-1);
  }

  /* 섹션 */
  .section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .section h2 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-sub);
    margin: 0 0 var(--space-3);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .section p {
    font-size: 15px;
    color: var(--text-main);
    line-height: 1.7;
    margin: 0;
  }

  .section.highlight {
    border-color: var(--accent);
    background: rgba(59, 130, 246, 0.05);
  }

  .section.highlight h2 {
    color: var(--accent);
  }

  .lead {
    font-size: 17px;
    font-weight: 500;
  }

  .section.action {
    border-color: var(--accent-green);
    background: rgba(34, 197, 94, 0.05);
  }

  .section.action h2 {
    color: var(--accent-green);
  }

  /* 근거 */
  .evidence {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .evidence li {
    padding: var(--space-3);
    background: var(--card-hover);
    border-radius: var(--radius);
  }

  .ev-source {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    background: rgba(59, 130, 246, 0.1);
    padding: 2px 8px;
    border-radius: var(--radius);
    margin-bottom: var(--space-1);
  }

  .ev-fact {
    display: block;
    font-size: 14px;
    color: var(--text-body);
    line-height: 1.6;
  }

  /* 영향도 */
  .impact {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .impact-score {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .score-num {
    font-size: 36px;
    font-weight: 700;
    color: var(--accent);
  }

  .score-max {
    font-size: 16px;
    color: var(--text-sub);
  }

  .impact-bar {
    height: 6px;
    background: var(--card-hover);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .impact-fill {
    height: 100%;
    background: var(--accent);
    border-radius: var(--radius-full);
  }

  .impact-reason {
    font-size: 14px;
    color: var(--text-body);
  }

  /* 관련 기사 */
  .articles {
    display: flex;
    flex-direction: column;
  }

  .articles li {
    border-bottom: 1px solid var(--border);
  }

  .articles li:last-child {
    border-bottom: none;
  }

  .articles a {
    display: block;
    padding: var(--space-3) 0;
  }

  .articles a:hover .art-title {
    color: var(--accent);
  }

  .art-title {
    display: block;
    font-size: 14px;
    color: var(--text-main);
    line-height: 1.5;
    margin-bottom: 4px;
  }

  .art-meta {
    font-size: 12px;
    color: var(--text-sub);
  }
</style>
