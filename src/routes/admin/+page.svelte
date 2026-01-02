<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { DashboardSummary, DailySignupStats, DailyViewStats, GenderStats, AgeGroupStats, GradeStats } from '$lib/types';
  import { getAdminDashboard, getAdminSignupStats, getAdminViewStats, getAdminGenderStats, getAdminAgeGroupStats, getAdminGradeStats } from '$lib/api';
  import { isLoggedIn, isAdmin } from '$lib/stores/auth';

  let summary: DashboardSummary | null = null;
  let signupStats: DailySignupStats[] = [];
  let viewStats: DailyViewStats[] = [];
  let genderStats: GenderStats | null = null;
  let ageGroupStats: AgeGroupStats[] = [];
  let gradeStats: GradeStats[] = [];
  let loading = true;
  let error: string | null = null;

  // 그래프 설정
  let statDays = 30;

  onMount(() => {
    const unsubscribe = isLoggedIn.subscribe(async (loggedIn) => {
      if (loggedIn) {
        // 관리자 권한 체크
        const adminUnsubscribe = isAdmin.subscribe(async (admin) => {
          if (!admin) {
            goto(`${base}/`);
            return;
          }
          await loadData();
          adminUnsubscribe();
        });
        unsubscribe();
      }
    });
    return unsubscribe;
  });

  async function loadData() {
    loading = true;
    error = null;
    try {
      const [summaryRes, signupRes, viewRes, genderRes, ageRes, gradeRes] = await Promise.all([
        getAdminDashboard(),
        getAdminSignupStats(statDays),
        getAdminViewStats(statDays),
        getAdminGenderStats(),
        getAdminAgeGroupStats(),
        getAdminGradeStats()
      ]);
      summary = summaryRes;
      signupStats = signupRes;
      viewStats = viewRes;
      genderStats = genderRes;
      ageGroupStats = ageRes;
      gradeStats = gradeRes;
    } catch (e: any) {
      error = e?.message ?? '데이터를 불러오는데 실패했습니다';
    } finally {
      loading = false;
    }
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  // 간단한 바 차트 계산
  function getBarWidth(value: number, max: number): number {
    if (max === 0) return 0;
    return (value / max) * 100;
  }

  function getMaxCount(stats: { count: number }[]): number {
    return Math.max(...stats.map(s => s.count), 1);
  }

  // 날짜 포맷
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
</script>

<div class="admin-page">
  <header class="page-header">
    <h1>관리자 대시보드</h1>
    <nav class="admin-nav">
      <a href="{base}/admin" class="nav-item active">대시보드</a>
      <a href="{base}/admin/users" class="nav-item">유저 관리</a>
    </nav>
  </header>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={loadData}>다시 시도</button>
    </div>
  {:else if summary}
    <!-- 요약 카드 -->
    <section class="summary-section">
      <div class="summary-grid">
        <div class="summary-card">
          <span class="summary-label">전체 사용자</span>
          <span class="summary-value">{formatNumber(summary.totalUsers)}</span>
          <span class="summary-sub">오늘 +{formatNumber(summary.todaySignups)}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">전체 조회수</span>
          <span class="summary-value">{formatNumber(summary.totalViews)}</span>
          <span class="summary-sub">오늘 +{formatNumber(summary.todayViews)}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">전체 카드</span>
          <span class="summary-value">{formatNumber(summary.totalCards)}</span>
          <span class="summary-sub">활성 {formatNumber(summary.activeCards)}</span>
        </div>
      </div>
    </section>

    <!-- 가입자 추이 그래프 -->
    <section class="chart-section">
      <div class="section-header">
        <h2>일별 가입자 추이</h2>
        <span class="period">최근 {statDays}일</span>
      </div>
      <div class="bar-chart">
        {#each signupStats.slice(-14) as stat}
          <div class="bar-item">
            <div class="bar-wrapper">
              <div
                class="bar"
                style="height: {getBarWidth(stat.count, getMaxCount(signupStats))}%"
              ></div>
            </div>
            <span class="bar-label">{formatDate(stat.date)}</span>
            <span class="bar-value">{stat.count}</span>
          </div>
        {/each}
      </div>
    </section>

    <!-- 조회수 추이 그래프 -->
    <section class="chart-section">
      <div class="section-header">
        <h2>일별 조회수 추이</h2>
        <span class="period">최근 {statDays}일</span>
      </div>
      <div class="bar-chart">
        {#each viewStats.slice(-14) as stat}
          <div class="bar-item">
            <div class="bar-wrapper">
              <div
                class="bar bar-view"
                style="height: {getBarWidth(stat.count, getMaxCount(viewStats))}%"
              ></div>
            </div>
            <span class="bar-label">{formatDate(stat.date)}</span>
            <span class="bar-value">{stat.count}</span>
          </div>
        {/each}
      </div>
    </section>

    <!-- 사용자 분포 -->
    <section class="distribution-section">
      <div class="dist-row">
        <!-- 성별 분포 -->
        {#if genderStats}
          <div class="dist-card">
            <h3>성별 분포</h3>
            <div class="dist-items">
              <div class="dist-item">
                <span class="dist-label">남성</span>
                <div class="dist-bar-wrapper">
                  <div
                    class="dist-bar male"
                    style="width: {getBarWidth(genderStats.male, genderStats.male + genderStats.female)}%"
                  ></div>
                </div>
                <span class="dist-value">{formatNumber(genderStats.male)}</span>
              </div>
              <div class="dist-item">
                <span class="dist-label">여성</span>
                <div class="dist-bar-wrapper">
                  <div
                    class="dist-bar female"
                    style="width: {getBarWidth(genderStats.female, genderStats.male + genderStats.female)}%"
                  ></div>
                </div>
                <span class="dist-value">{formatNumber(genderStats.female)}</span>
              </div>
            </div>
          </div>
        {/if}

        <!-- 연령대 분포 -->
        <div class="dist-card">
          <h3>연령대 분포</h3>
          <div class="dist-items">
            {#each ageGroupStats as stat}
              <div class="dist-item">
                <span class="dist-label">{stat.displayName}</span>
                <div class="dist-bar-wrapper">
                  <div
                    class="dist-bar age"
                    style="width: {getBarWidth(stat.count, getMaxCount(ageGroupStats))}%"
                  ></div>
                </div>
                <span class="dist-value">{formatNumber(stat.count)}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- 회원 등급 분포 -->
        <div class="dist-card">
          <h3>회원 등급 분포</h3>
          <div class="dist-items">
            {#each gradeStats as stat}
              <div class="dist-item">
                <span class="dist-label">{stat.displayName}</span>
                <div class="dist-bar-wrapper">
                  <div
                    class="dist-bar grade grade-{stat.grade.toLowerCase()}"
                    style="width: {getBarWidth(stat.count, getMaxCount(gradeStats))}%"
                  ></div>
                </div>
                <span class="dist-value">{formatNumber(stat.count)}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .admin-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .page-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .admin-nav {
    display: flex;
    gap: var(--space-2);
  }

  .nav-item {
    padding: var(--space-3) var(--space-4);
    font-size: 15px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--card);
    border-radius: var(--radius);
    transition: all 0.15s;
  }

  .nav-item:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }

  .nav-item.active {
    color: white;
    background: var(--accent);
  }

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

  .error button {
    margin-top: var(--space-4);
    padding: var(--space-3) var(--space-5);
    background: var(--accent);
    color: white;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius);
  }

  /* 요약 카드 */
  .summary-section {
    margin-top: var(--space-2);
  }

  .summary-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .summary-card {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .summary-label {
    font-size: 14px;
    color: var(--text-tertiary);
  }

  .summary-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .summary-sub {
    font-size: 14px;
    color: var(--system-green);
    font-weight: 500;
  }

  /* 차트 섹션 */
  .chart-section {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-5);
  }

  .section-header h2 {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .period {
    font-size: 14px;
    color: var(--text-tertiary);
  }

  /* 바 차트 */
  .bar-chart {
    display: flex;
    gap: 6px;
    height: 140px;
    align-items: flex-end;
    overflow-x: auto;
    padding-bottom: var(--space-6);
  }

  .bar-item {
    flex: 1;
    min-width: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .bar-wrapper {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .bar {
    width: 100%;
    max-width: 28px;
    background: var(--accent);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
  }

  .bar-view {
    background: var(--system-green);
  }

  .bar-label {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 6px;
    white-space: nowrap;
  }

  .bar-value {
    position: absolute;
    bottom: -22px;
    font-size: 12px;
    color: var(--text-tertiary);
    font-weight: 500;
  }

  /* 분포 섹션 */
  .distribution-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .dist-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .dist-card {
    background: var(--card);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
  }

  .dist-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .dist-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .dist-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .dist-label {
    font-size: 15px;
    color: var(--text-secondary);
    width: 70px;
    flex-shrink: 0;
  }

  .dist-bar-wrapper {
    flex: 1;
    height: 10px;
    background: var(--bg-tertiary);
    border-radius: 5px;
    overflow: hidden;
  }

  .dist-bar {
    height: 100%;
    border-radius: 5px;
  }

  .dist-bar.male {
    background: #3b82f6;
  }

  .dist-bar.female {
    background: #ec4899;
  }

  .dist-bar.age {
    background: var(--accent);
  }

  /* 등급별 색상 */
  .dist-bar.grade-bronze {
    background: #cd7f32;
  }

  .dist-bar.grade-silver {
    background: #c0c0c0;
  }

  .dist-bar.grade-gold {
    background: #ffd700;
  }

  .dist-bar.grade-platinum {
    background: #e5e4e2;
  }

  .dist-bar.grade-diamond {
    background: #b9f2ff;
  }

  .dist-value {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    width: 60px;
    text-align: right;
    flex-shrink: 0;
  }
</style>
