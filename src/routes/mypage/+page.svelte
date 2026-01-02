<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getMyProfile, deleteMyAccount } from '$lib/api';
  import { auth, currentUser } from '$lib/stores/auth';
  import { settings, type FontSize, type StartPage } from '$lib/stores/settings';
  import { getAgeGroupLabel, getGenderLabel } from '$lib/utils/labels';
  import type { MyProfile } from '$lib/types';

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'small', label: '작게' },
    { value: 'medium', label: '보통' },
    { value: 'large', label: '크게' }
  ];

  const startPageOptions: { value: StartPage; label: string }[] = [
    { value: 'home', label: '홈' },
    { value: 'feed', label: '피드' },
    { value: 'trending', label: '트렌드' }
  ];

  let profile: MyProfile | null = null;
  let loading = true;
  let error = '';

  let showDeleteModal = false;
  let deletePassword = '';
  let deleteLoading = false;
  let deleteError = '';

  onMount(async () => {
    if (!$currentUser) {
      loading = false;
      return;
    }

    try {
      profile = await getMyProfile();
    } catch (e) {
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

  async function handleLogout() {
    await auth.logout();
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
  <title>설정 - SHIFT</title>
</svelte:head>

<div class="page">
  <h1 class="page-title">설정</h1>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="error-box">
      <p>{error}</p>
    </div>
  {:else if profile}
    <!-- 프로필 섹션 -->
    <section class="section">
      <div class="profile-row">
        <div class="profile-avatar">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{profile.username}</h2>
          <p class="profile-email">{profile.email}</p>
        </div>
      </div>
    </section>

    <!-- 앱 설정 -->
    <section class="section">
      <h3 class="section-title">앱 설정</h3>
      <div class="group">
        <div class="row">
          <span class="row-label">다크 모드</span>
          <button
            class="toggle"
            class:active={$settings.theme === 'dark'}
            on:click={() => settings.toggleTheme()}
          >
            <span class="toggle-knob"></span>
          </button>
        </div>

        <div class="row">
          <span class="row-label">텍스트 크기</span>
          <div class="segment-control">
            {#each fontSizeOptions as opt}
              <button
                class="segment"
                class:active={$settings.fontSize === opt.value}
                on:click={() => settings.setFontSize(opt.value)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="row">
          <span class="row-label">시작 화면</span>
          <div class="segment-control">
            {#each startPageOptions as opt}
              <button
                class="segment"
                class:active={$settings.startPage === opt.value}
                on:click={() => settings.setStartPage(opt.value)}
              >
                {opt.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- 계정 정보 -->
    <section class="section">
      <h3 class="section-title">계정 정보</h3>
      <div class="group">
        <div class="row">
          <span class="row-label">성별</span>
          <span class="row-value">{getGenderLabel(profile.gender)}</span>
        </div>
        <div class="row">
          <span class="row-label">연령대</span>
          <span class="row-value">{getAgeGroupLabel(profile.ageGroup)}</span>
        </div>
        <div class="row">
          <span class="row-label">가입일</span>
          <span class="row-value">{formatDate(profile.createdAt)}</span>
        </div>
        <div class="row">
          <span class="row-label">저장한 브리핑</span>
          <span class="row-value">{profile.bookmarkCount}개</span>
        </div>
      </div>
    </section>

    <!-- 앱 정보 -->
    <section class="section">
      <h3 class="section-title">정보</h3>
      <div class="group">
        <a href="{base}/terms" class="row link">
          <span class="row-label">이용약관</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </a>
        <a href="{base}/privacy" class="row link">
          <span class="row-label">개인정보처리방침</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </a>
      </div>
    </section>

    <!-- 계정 관리 -->
    <section class="section">
      <div class="group">
        <button class="row link" on:click={handleLogout}>
          <span class="row-label logout">로그아웃</span>
        </button>
        <button class="row link" on:click={openDeleteModal}>
          <span class="row-label danger">회원 탈퇴</span>
        </button>
      </div>
    </section>
  {/if}
</div>

<!-- 탈퇴 모달 -->
{#if showDeleteModal}
  <div class="modal-backdrop" on:click={closeDeleteModal} role="button" tabindex="-1" on:keydown={(e) => e.key === 'Escape' && closeDeleteModal()}>
    <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
      <h2 class="modal-title">회원 탈퇴</h2>
      <p class="modal-desc">
        정말 탈퇴하시겠습니까?<br>
        모든 데이터가 삭제되며 복구할 수 없습니다.
      </p>

      <input
        type="password"
        class="modal-input"
        bind:value={deletePassword}
        placeholder="비밀번호 확인"
        disabled={deleteLoading}
      />

      {#if deleteError}
        <p class="modal-error">{deleteError}</p>
      {/if}

      <div class="modal-buttons">
        <button class="modal-btn cancel" on:click={closeDeleteModal} disabled={deleteLoading}>
          취소
        </button>
        <button class="modal-btn danger" on:click={handleDeleteAccount} disabled={deleteLoading}>
          {deleteLoading ? '처리 중...' : '탈퇴하기'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    padding-top: var(--space-4);
    margin: 0;
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
    padding: var(--space-5);
    color: var(--system-red);
    font-size: 16px;
  }

  /* 프로필 */
  .profile-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-5);
    background: var(--card);
    border-radius: var(--radius-lg);
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--accent), var(--system-purple));
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .profile-email {
    font-size: 15px;
    color: var(--text-tertiary);
    margin: 4px 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 섹션 */
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-left: var(--space-4);
    margin: 0;
  }

  /* 그룹 */
  .group {
    background: var(--card);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  /* 행 */
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    min-height: 52px;
    border-bottom: 0.5px solid var(--separator);
  }

  .row:last-child {
    border-bottom: none;
  }

  .row.link {
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease);
    width: 100%;
    text-align: left;
  }

  .row.link:active {
    background: var(--bg-tertiary);
  }

  .row-label {
    font-size: 17px;
    color: var(--text-primary);
  }

  .row-label.logout {
    color: var(--accent);
    font-weight: 500;
  }

  .row-label.danger {
    color: var(--system-red);
    font-weight: 500;
  }

  .row-value {
    font-size: 17px;
    color: var(--text-tertiary);
  }

  .chevron {
    width: 20px;
    height: 20px;
    color: var(--text-quaternary);
  }

  /* iOS 토글 */
  .toggle {
    position: relative;
    width: 51px;
    height: 31px;
    background: var(--bg-tertiary);
    border-radius: 16px;
    transition: background var(--duration) var(--ease);
  }

  .toggle.active {
    background: var(--system-green);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    background: white;
    border-radius: 50%;
    transition: transform var(--duration) var(--ease);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.16);
  }

  .toggle.active .toggle-knob {
    transform: translateX(20px);
  }

  /* 세그먼트 컨트롤 */
  .segment-control {
    display: flex;
    background: var(--bg-tertiary);
    padding: 2px;
    border-radius: var(--radius-sm);
  }

  .segment {
    padding: 8px 14px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: 6px;
    transition: all var(--duration) var(--ease);
    white-space: nowrap;
  }

  .segment.active {
    background: var(--bg-elevated);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }

  /* 모달 */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-5);
    z-index: 1000;
  }

  .modal {
    background: var(--bg-elevated);
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    max-width: 340px;
    width: 100%;
    animation: scaleIn var(--duration) var(--ease-spring);
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .modal-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    margin: 0 0 var(--space-3);
  }

  .modal-desc {
    font-size: 15px;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.6;
    margin: 0 0 var(--space-5);
  }

  .modal-input {
    width: 100%;
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: none;
    border-radius: var(--radius);
    color: var(--text-primary);
    font-size: 16px;
    margin-bottom: var(--space-4);
  }

  .modal-input::placeholder {
    color: var(--text-tertiary);
  }

  .modal-input:focus {
    outline: none;
    box-shadow: 0 0 0 4px var(--accent-glow);
  }

  .modal-error {
    font-size: 14px;
    color: var(--system-red);
    text-align: center;
    margin: 0 0 var(--space-4);
  }

  .modal-buttons {
    display: flex;
    gap: var(--space-3);
  }

  .modal-btn {
    flex: 1;
    padding: var(--space-4);
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--radius);
    transition: opacity var(--duration-fast) var(--ease);
  }

  .modal-btn:disabled {
    opacity: 0.5;
  }

  .modal-btn.cancel {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .modal-btn.danger {
    background: var(--system-red);
    color: white;
  }
</style>
