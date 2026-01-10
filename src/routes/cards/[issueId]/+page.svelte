<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from "svelte";
  import { getCard, getBookmarkStatus, addBookmark, removeBookmark } from "$lib/api";
  import type { CardDetail } from "$lib/types";
  import { getGroupLabel, formatRelativeTime, formatViewCount, getLifecycleInfo, formatLifecycleChange } from "$lib/utils/labels";
  import { isLoggedIn } from "$lib/stores/auth";
  import LifecycleBadge from "$lib/components/LifecycleBadge.svelte";

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
      if ($isLoggedIn) {
        try {
          const status = await getBookmarkStatus(Number(params.issueId));
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
    if (!$isLoggedIn) return;

    bookmarkLoading = true;
    try {
      if (isBookmarked) {
        await removeBookmark(Number(params.issueId));
        isBookmarked = false;
      } else {
        await addBookmark(Number(params.issueId));
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

  /**
   * 텍스트를 문단 배열로 분리
   * - 기존 줄바꿈(\n\n)이 있으면 그대로 사용
   * - 없으면 문장 단위로 분리하여 적절히 그룹화
   */
  function splitIntoParagraphs(text: string | undefined): string[] {
    if (!text) return [];

    const trimmed = text.trim();

    // 이미 문단 구분(\n\n)이 있으면 그대로 사용
    if (trimmed.includes('\n\n')) {
      return trimmed.split(/\n\n+/).map(p => p.trim()).filter(p => p);
    }

    // 단일 줄바꿈이 있으면 그것도 문단으로 처리
    if (trimmed.includes('\n')) {
      return trimmed.split(/\n+/).map(p => p.trim()).filter(p => p);
    }

    // 한글 문장 분리 (더 정확한 패턴)
    // - 마침표/물음표/느낌표 뒤에 공백이 오는 경우 분리
    // - 단, 숫자.숫자 (예: 1.5%), 영문 약어 (예: U.S.) 는 제외
    const sentences = trimmed
      .split(/(?<=[다요죠음임함됨됩니까][\.\?!])\s+/)
      .flatMap(s => s.split(/(?<=[^0-9])[\.\?!]\s+(?=[가-힣])/))
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // 문장이 2개 이하면 그냥 하나의 문단으로
    if (sentences.length <= 2) {
      return [trimmed];
    }

    // 긴 텍스트면 3문장씩 그룹화하여 자연스러운 문단 생성
    const paragraphs: string[] = [];
    let current: string[] = [];
    const SENTENCES_PER_PARAGRAPH = 3;

    sentences.forEach((sentence, i) => {
      current.push(sentence);
      if (current.length >= SENTENCES_PER_PARAGRAPH || i === sentences.length - 1) {
        paragraphs.push(current.join(' '));
        current = [];
      }
    });

    if (current.length > 0) {
      paragraphs.push(current.join(' '));
    }

    return paragraphs;
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
        <div class="header-left">
          <span class="cat">{getGroupLabel(detail.issueGroup)}</span>
          {#if detail.lifecycle}
            <LifecycleBadge lifecycle={detail.lifecycle} size="medium" />
          {/if}
        </div>
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

    <!-- 이슈 생애주기 -->
    {#if detail.lifecycle}
      {@const info = getLifecycleInfo(detail.lifecycle.stage)}
      <section class="section lifecycle-section" data-stage={detail.lifecycle.stage}>
        <h2>이슈 생애주기</h2>
        <div class="lifecycle-content">
          <div class="lifecycle-stage">
            <span class="lifecycle-emoji">{info.emoji}</span>
            <div class="lifecycle-info">
              <span class="lifecycle-label">{info.label}</span>
              <span class="lifecycle-desc">{info.description}</span>
            </div>
          </div>
          <div class="lifecycle-stats">
            <div class="lifecycle-stat">
              <span class="stat-value">{formatLifecycleChange(detail.lifecycle)}</span>
            </div>
            {#if detail.lifecycle.peakDate}
              <div class="lifecycle-stat">
                <span class="stat-label">정점 도달</span>
                <span class="stat-value">{formatRelativeTime(detail.lifecycle.peakDate)}</span>
              </div>
            {/if}
            <div class="lifecycle-stat">
              <span class="stat-label">현재 기사 수</span>
              <span class="stat-value">{detail.lifecycle.currentArticleCount}개 (24시간)</span>
            </div>
            {#if detail.lifecycle.peakArticleCount > 0}
              <div class="lifecycle-stat">
                <span class="stat-label">정점 기사 수</span>
                <span class="stat-value">{detail.lifecycle.peakArticleCount}개</span>
              </div>
            {/if}
          </div>
        </div>
      </section>
    {/if}

    <!-- 핵심 결론 -->
    <section class="section highlight">
      <h2>핵심 요약</h2>
      {#each splitIntoParagraphs(card.conclusion) as paragraph}
        <p class="lead">{paragraph}</p>
      {/each}
    </section>

    <!-- 왜 중요한가 -->
    <section class="section">
      <h2>왜 중요한가</h2>
      {#each splitIntoParagraphs(card.why_it_matters) as paragraph}
        <p>{paragraph}</p>
      {/each}
    </section>

    <!-- 근거 -->
    {#if card.evidence?.length > 0}
      <section class="section">
        <h2>근거</h2>
        <ul class="evidence">
          {#each card.evidence as ev}
            <li>
              <span class="ev-source">{ev.source}</span>
              {#each splitIntoParagraphs(ev.fact) as paragraph}
                <span class="ev-fact">{paragraph}</span>
              {/each}
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- 반대 시나리오 -->
    <section class="section">
      <h2>반대 시나리오</h2>
      {#each splitIntoParagraphs(card.counter_scenario) as paragraph}
        <p>{paragraph}</p>
      {/each}
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
        {#each splitIntoParagraphs(card.impact?.reason) as paragraph}
          <p class="impact-reason">{paragraph}</p>
        {/each}
      </div>
    </section>

    <!-- 행동 가이드 -->
    <section class="section action">
      <h2>행동 가이드</h2>
      {#each splitIntoParagraphs(card.action_guide) as paragraph}
        <p>{paragraph}</p>
      {/each}
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
    min-height: 40vh;
    align-items: center;
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

  .error {
    text-align: center;
    padding: var(--space-6) 0;
    color: var(--text-secondary);
    font-size: 16px;
  }

  .error a {
    display: inline-block;
    margin-top: var(--space-3);
    color: var(--accent);
    font-weight: 500;
  }

  .article {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .back {
    font-size: 15px;
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .back:hover {
    color: var(--accent);
  }

  /* 헤더 */
  .header {
    padding-bottom: var(--space-5);
    border-bottom: 1px solid var(--separator);
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .cat {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
  }

  .bookmark-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
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
    width: 24px;
    height: 24px;
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.4;
    margin: 0 0 var(--space-3);
    letter-spacing: -0.02em;
  }

  .signal {
    font-size: 17px;
    color: var(--accent);
    line-height: 1.6;
    margin: 0 0 var(--space-3);
    font-weight: 500;
  }

  .meta {
    font-size: 14px;
    color: var(--text-tertiary);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  /* 섹션 */
  .section {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
  }

  .section h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-tertiary);
    margin: 0 0 var(--space-4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .section p {
    font-size: 17px;
    color: var(--text-primary);
    line-height: 1.8;  /* 가독성 향상: 1.7 → 1.8 */
    margin: 0;
    word-break: keep-all;  /* 한글 단어 단위 줄바꿈 */
  }

  .section p + p {
    margin-top: var(--space-5);  /* 문단 간격 확대: 16px → 20px */
  }

  .section.highlight {
    background: rgba(var(--accent-rgb), 0.08);
  }

  .section.highlight h2 {
    color: var(--accent);
  }

  .lead {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.75;  /* 가독성 향상 */
    word-break: keep-all;
  }

  .section.action {
    background: rgba(52, 199, 89, 0.08);
  }

  .section.action h2 {
    color: var(--system-green);
  }

  /* 근거 */
  .evidence {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .evidence li {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border-radius: var(--radius);
  }

  .ev-source {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    background: rgba(var(--accent-rgb), 0.15);
    padding: 4px 10px;
    border-radius: var(--radius);
    margin-bottom: var(--space-2);
  }

  .ev-fact {
    display: block;
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .ev-fact + .ev-fact {
    margin-top: var(--space-2);
  }

  /* 영향도 */
  .impact {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .impact-score {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .score-num {
    font-size: 42px;
    font-weight: 700;
    color: var(--accent);
  }

  .score-max {
    font-size: 18px;
    color: var(--text-tertiary);
  }

  .impact-bar {
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .impact-fill {
    height: 100%;
    background: var(--accent);
    border-radius: var(--radius-full);
  }

  .impact-reason {
    font-size: 16px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  /* 관련 기사 */
  .articles {
    display: flex;
    flex-direction: column;
  }

  .articles li {
    border-bottom: 1px solid var(--separator);
  }

  .articles li:last-child {
    border-bottom: none;
  }

  .articles a {
    display: block;
    padding: var(--space-4) 0;
  }

  .articles a:hover .art-title {
    color: var(--accent);
  }

  .art-title {
    display: block;
    font-size: 16px;
    color: var(--text-primary);
    line-height: 1.5;
    margin-bottom: var(--space-1);
  }

  .art-meta {
    font-size: 14px;
    color: var(--text-tertiary);
  }

  /* 이슈 생애주기 섹션 */
  .lifecycle-section {
    background: var(--card);
  }

  .lifecycle-section[data-stage="EMERGING"] {
    background: rgba(251, 146, 60, 0.08);
  }

  .lifecycle-section[data-stage="SPREADING"] {
    background: rgba(74, 222, 128, 0.08);
  }

  .lifecycle-section[data-stage="PEAK"] {
    background: rgba(251, 191, 36, 0.08);
  }

  .lifecycle-section[data-stage="DECLINING"] {
    background: rgba(96, 165, 250, 0.08);
  }

  .lifecycle-section[data-stage="DORMANT"] {
    background: rgba(113, 113, 122, 0.08);
  }

  .lifecycle-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .lifecycle-stage {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .lifecycle-emoji {
    font-size: 36px;
  }

  .lifecycle-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .lifecycle-label {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .lifecycle-desc {
    font-size: 15px;
    color: var(--text-secondary);
  }

  .lifecycle-stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .lifecycle-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border-radius: var(--radius);
    min-width: 110px;
  }

  .lifecycle-stat .stat-label {
    font-size: 12px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .lifecycle-stat .stat-value {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }
</style>
