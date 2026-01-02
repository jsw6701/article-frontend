<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getMyProfile, deleteMyAccount } from '$lib/api';
  import { auth, currentUser } from '$lib/stores/auth';
  import { settings, type FontSize, type StartPage } from '$lib/stores/settings';
  import { getAgeGroupLabel, getGenderLabel } from '$lib/utils/labels';
  import type { MyProfile } from '$lib/types';

  // 글꼴 크기 옵션
  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'small', label: '작게' },
    { value: 'medium', label: '보통' },
    { value: 'large', label: '크게' }
  ];

  // 시작 화면 옵션
  const startPageOptions: { value: StartPage; label: string }[] = [
    { value: 'home', label: '홈' },
    { value: 'feed', label: '피드' },
    { value: 'trending', label: '트렌딩' }
  ];

  let profile: MyProfile | null = null;
  let loading = true;
  let error = '';

  // 탈퇴 모달 상태
  let showDeleteModal = false;
  let deletePassword = '';
  let deleteLoading = false;
  let deleteError = '';

  onMount(async () => {
    // 로그인 안 된 상태면 아무것도 안함 (layout에서 리다이렉트 처리)
    if (!$currentUser) {
      loading = false;
      return;
    }

    try {
      profile = await getMyProfile();
    } catch (e) {
      // API 실패 시 기본 정보라도 표시
      console.error('getMyProfile error:', e);
      error = e instanceof Error ? e.message : '프로필을 불러올 수 없습니다.';
    } finally {
      loading = false;
    }
  });

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getGradeColor(grade: string): string {
    const colors: Record<string, string> = {
      BRONZE: '#cd7f32',
      SILVER: '#c0c0c0',
      GOLD: '#ffd700',
      PLATINUM: '#e5e4e2',
      DIAMOND: '#b9f2ff'
    };
    return colors[grade] || 'var(--text-sub)';
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      deleteError = '비밀번호를 입력해주세요.';
      return;
    }

    deleteLoading = true;
    deleteError = '';

    try {
      const result = await deleteMyAccount(deletePassword);
      if (result.success) {
        auth.clear();
        goto(`${base}/login`);
      } else {
        deleteError = result.message || '탈퇴 처리 중 오류가 발생했습니다.';
      }
    } catch (e) {
      deleteError = e instanceof Error ? e.message : '탈퇴 처리 중 오류가 발생했습니다.';
    } finally {
      deleteLoading = false;
    }
  }

  function openDeleteModal() {
    showDeleteModal = true;
    deletePassword = '';
    deleteError = '';
  }

  function closeDeleteModal() {
    showDeleteModal = false;
    deletePassword = '';
    deleteError = '';
  }
</script>

<svelte:head>
  <title>마이페이지 - SHIFT</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <h1>마이페이지</h1>
  </header>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>로딩 중...</p>
    </div>
  {:else if error}
    <div class="error-card">
      <p>{error}</p>
    </div>
  {:else if profile}
    <!-- 프로필 카드 -->
    <section class="card profile-card">
      <div class="profile-header">
        <div class="profile-avatar">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{profile.username}</h2>
          <span class="profile-grade" style="color: {getGradeColor(profile.grade)}">
            {profile.gradeDisplayName}
          </span>
        </div>
      </div>
    </section>

    <!-- 계정 정보 -->
    <section class="card">
      <h3 class="card-title">계정 정보</h3>
      <dl class="info-list">
        <div class="info-row">
          <dt>이메일</dt>
          <dd>
            {profile.email}
            {#if profile.emailVerified}
              <span class="badge verified">인증됨</span>
            {:else}
              <span class="badge unverified">미인증</span>
            {/if}
          </dd>
        </div>
        <div class="info-row">
          <dt>성별</dt>
          <dd>{getGenderLabel(profile.gender)}</dd>
        </div>
        <div class="info-row">
          <dt>연령대</dt>
          <dd>{getAgeGroupLabel(profile.ageGroup)}</dd>
        </div>
        <div class="info-row">
          <dt>가입일</dt>
          <dd>{formatDate(profile.createdAt)}</dd>
        </div>
        <div class="info-row">
          <dt>저장한 브리핑</dt>
          <dd>{profile.bookmarkCount}개</dd>
        </div>
      </dl>
    </section>

    <!-- 설정 -->
    <section class="card">
      <h3 class="card-title">설정</h3>
      <div class="setting-list">
        <!-- 다크 모드 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">다크 모드</span>
            <span class="setting-desc">어두운 테마를 사용합니다</span>
          </div>
          <button
            class="toggle-switch"
            class:active={$settings.theme === 'dark'}
            on:click={() => settings.toggleTheme()}
            aria-label="다크 모드 전환"
          >
            <span class="toggle-slider"></span>
          </button>
        </div>

        <!-- 글꼴 크기 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">글꼴 크기</span>
            <span class="setting-desc">텍스트 크기를 조절합니다</span>
          </div>
          <div class="select-group">
            {#each fontSizeOptions as option}
              <button
                class="select-btn"
                class:active={$settings.fontSize === option.value}
                on:click={() => settings.setFontSize(option.value)}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- 시작 화면 -->
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">시작 화면</span>
            <span class="setting-desc">앱 시작 시 표시할 화면</span>
          </div>
          <div class="select-group">
            {#each startPageOptions as option}
              <button
                class="select-btn"
                class:active={$settings.startPage === option.value}
                on:click={() => settings.setStartPage(option.value)}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- 메뉴 -->
    <section class="card menu-card">
      <h3 class="card-title">앱 정보</h3>
      <nav class="menu-list">
        <a href="{base}/terms" class="menu-item">
          <span>서비스 이용약관</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </a>
        <a href="{base}/privacy" class="menu-item">
          <span>개인정보처리방침</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </a>
      </nav>
    </section>

    <!-- 위험 영역 -->
    <section class="card danger-card">
      <h3 class="card-title">계정 관리</h3>
      <div class="danger-actions">
        <button class="btn-danger" on:click={openDeleteModal}>
          회원 탈퇴
        </button>
      </div>
      <p class="danger-warning">
        회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
      </p>
    </section>
  {/if}
</div>

<!-- 탈퇴 확인 모달 -->
{#if showDeleteModal}
  <div class="modal-overlay" on:click={closeDeleteModal} role="button" tabindex="-1" on:keydown={(e) => e.key === 'Escape' && closeDeleteModal()}>
    <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <h2 id="delete-modal-title">회원 탈퇴</h2>
      <p class="modal-desc">
        정말 탈퇴하시겠습니까?<br>
        모든 데이터가 삭제되며 복구할 수 없습니다.
      </p>

      <div class="form-group">
        <label for="delete-password">비밀번호 확인</label>
        <input
          id="delete-password"
          type="password"
          bind:value={deletePassword}
          placeholder="현재 비밀번호를 입력하세요"
          disabled={deleteLoading}
        />
      </div>

      {#if deleteError}
        <p class="error-text">{deleteError}</p>
      {/if}

      <div class="modal-actions">
        <button class="btn-secondary" on:click={closeDeleteModal} disabled={deleteLoading}>
          취소
        </button>
        <button class="btn-danger" on:click={handleDeleteAccount} disabled={deleteLoading}>
          {#if deleteLoading}
            처리 중...
          {:else}
            탈퇴하기
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .page-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-main);
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    gap: var(--space-3);
    color: var(--text-sub);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-sub);
    margin-bottom: var(--space-3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .error-card {
    background: var(--card);
    border: 1px solid var(--accent-red);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    color: var(--accent-red);
  }

  /* 프로필 카드 */
  .profile-card {
    background: var(--card);
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
    background: var(--accent);
    color: white;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
  }

  .profile-info {
    flex: 1;
  }

  .profile-name {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 4px;
  }

  .profile-grade {
    font-size: 14px;
    font-weight: 600;
  }

  /* 정보 리스트 */
  .info-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--border);
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .info-row dt {
    font-size: 14px;
    color: var(--text-sub);
  }

  .info-row dd {
    font-size: 14px;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .badge {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: var(--radius);
    font-weight: 500;
  }

  .badge.verified {
    background: rgba(74, 222, 128, 0.15);
    color: var(--accent-green);
  }

  .badge.unverified {
    background: rgba(248, 113, 113, 0.15);
    color: var(--accent-red);
  }

  /* 메뉴 */
  .menu-list {
    display: flex;
    flex-direction: column;
  }

  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--border);
    color: var(--text-main);
    transition: color 0.2s var(--ease);
  }

  .menu-item:last-child {
    border-bottom: none;
  }

  .menu-item:hover {
    color: var(--accent);
  }

  .menu-item svg {
    width: 20px;
    height: 20px;
    color: var(--text-sub);
  }

  /* 위험 영역 */
  .danger-card {
    border-color: var(--accent-red);
  }

  .danger-card .card-title {
    color: var(--accent-red);
  }

  .danger-actions {
    margin-bottom: var(--space-2);
  }

  .btn-danger {
    background: var(--accent-red);
    color: white;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.2s var(--ease);
  }

  .btn-danger:hover {
    opacity: 0.9;
  }

  .btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .danger-warning {
    font-size: 12px;
    color: var(--text-sub);
  }

  /* 모달 */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    z-index: 1000;
  }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
    max-width: 400px;
    width: 100%;
  }

  .modal h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: var(--space-2);
  }

  .modal-desc {
    font-size: 14px;
    color: var(--text-body);
    margin-bottom: var(--space-4);
    line-height: 1.6;
  }

  .form-group {
    margin-bottom: var(--space-3);
  }

  .form-group label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-sub);
    margin-bottom: var(--space-1);
  }

  .form-group input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: var(--card-hover);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-main);
    font-size: 14px;
  }

  .form-group input:focus {
    border-color: var(--accent);
    outline: none;
  }

  .error-text {
    color: var(--accent-red);
    font-size: 13px;
    margin-bottom: var(--space-3);
  }

  .modal-actions {
    display: flex;
    gap: var(--space-2);
    justify-content: flex-end;
  }

  .btn-secondary {
    background: var(--card-hover);
    color: var(--text-main);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    border: 1px solid var(--border);
    transition: background 0.2s var(--ease);
  }

  .btn-secondary:hover {
    background: var(--border);
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 설정 */
  .setting-list {
    display: flex;
    flex-direction: column;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) 0;
  }

  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .setting-label {
    font-size: 14px;
    color: var(--text-main);
    font-weight: 500;
  }

  .setting-desc {
    font-size: 12px;
    color: var(--text-sub);
  }

  /* 토글 스위치 */
  .toggle-switch {
    position: relative;
    width: 48px;
    height: 28px;
    background: var(--border);
    border-radius: 14px;
    cursor: pointer;
    transition: background 0.3s var(--ease);
  }

  .toggle-switch.active {
    background: var(--accent);
  }

  .toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s var(--ease);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch.active .toggle-slider {
    transform: translateX(20px);
  }

  /* 선택 그룹 - iOS 세그먼트 컨트롤 스타일 */
  .select-group {
    display: flex;
    background: var(--border);
    border-radius: 8px;
    position: relative;
  }

  .select-btn {
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-sub);
    border-radius: 8px;
    transition: all 0.25s var(--ease);
    text-align: center;
    white-space: nowrap;
  }

  .select-btn:hover:not(.active) {
    color: var(--text-body);
  }

  .select-btn.active {
    background: var(--card);
    color: var(--text-main);
    font-weight: 600;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 2px 6px rgba(0, 0, 0, 0.06);
  }

  /* 라이트 테마 */
  :global([data-theme="light"]) .select-group {
    background: rgba(0, 0, 0, 0.06);
  }

  :global([data-theme="light"]) .select-btn.active {
    background: white;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.04);
  }
</style>
