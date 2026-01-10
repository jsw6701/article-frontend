<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { Capacitor } from '@capacitor/core';
  import { getMyProfile, deleteMyAccount, changePassword, updateProfile } from '$lib/api';
  import { auth, currentUser } from '$lib/stores/auth';
  import { settings, type FontSize, type StartPage } from '$lib/stores/settings';
  import { pushNotification, pushSettings, type PushSettings } from '$lib/stores/pushNotification';
  import { getAgeGroupLabel, getGenderLabel } from '$lib/utils/labels';
  import type { MyProfile, Gender, AgeGroup } from '$lib/types';

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

  const genderOptions: { value: Gender; label: string }[] = [
    { value: 'MALE', label: '남성' },
    { value: 'FEMALE', label: '여성' }
  ];

  const ageGroupOptions: { value: AgeGroup; label: string }[] = [
    { value: 'TEENS', label: '10대' },
    { value: 'TWENTIES', label: '20대' },
    { value: 'THIRTIES', label: '30대' },
    { value: 'FORTIES', label: '40대' },
    { value: 'FIFTIES', label: '50대' },
    { value: 'SIXTIES_PLUS', label: '60대 이상' }
  ];

  let profile: MyProfile | null = null;
  let loading = true;
  let error = '';

  // 탈퇴 모달 상태
  let showDeleteModal = false;
  let deletePassword = '';
  let deleteLoading = false;
  let deleteError = '';

  // 비밀번호 변경 모달 상태
  let showPasswordModal = false;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let passwordLoading = false;
  let passwordError = '';
  let passwordSuccess = '';

  // 프로필 수정 모달 상태
  let showProfileModal = false;
  let editGender: Gender = 'MALE';
  let editAgeGroup: AgeGroup = 'TWENTIES';
  let profileLoading = false;
  let profileError = '';
  let profileSuccess = '';

  // 푸시 알림 상태
  let isNative = false;
  let pushLoading = false;

  onMount(async () => {
    // 네이티브 플랫폼 체크
    isNative = Capacitor.isNativePlatform();

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

  // 푸시 알림 토글 핸들러
  async function handlePushToggle(enabled: boolean) {
    pushLoading = true;
    try {
      await pushNotification.setEnabled(enabled);
    } finally {
      pushLoading = false;
    }
  }

  async function handlePushSettingChange(key: keyof PushSettings, value: boolean) {
    pushNotification.updateSettings({ [key]: value });
  }

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

  // 비밀번호 변경
  function openPasswordModal() {
    showPasswordModal = true;
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordError = '';
    passwordSuccess = '';
  }

  function closePasswordModal() {
    showPasswordModal = false;
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordError = '';
    passwordSuccess = '';
  }

  function validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: '비밀번호는 8자 이상이어야 합니다.' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: '비밀번호에 숫자가 포함되어야 합니다.' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: '비밀번호에 특수문자가 포함되어야 합니다.' };
    }
    return { valid: true, message: '' };
  }

  function getPasswordStrength(password: string): { level: number; label: string; color: string } {
    if (!password) return { level: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: '약함', color: 'var(--system-red)' };
    if (score <= 3) return { level: 2, label: '보통', color: 'var(--system-yellow)' };
    return { level: 3, label: '강함', color: 'var(--system-green)' };
  }

  $: passwordStrength = getPasswordStrength(newPassword);

  async function handleChangePassword() {
    passwordError = '';
    passwordSuccess = '';

    if (!currentPassword) {
      passwordError = '현재 비밀번호를 입력해주세요.';
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      passwordError = validation.message;
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordError = '새 비밀번호가 일치하지 않습니다.';
      return;
    }

    passwordLoading = true;
    try {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.success) {
        passwordSuccess = '비밀번호가 변경되었습니다.';
        setTimeout(() => closePasswordModal(), 1500);
      } else {
        passwordError = result.message || '비밀번호 변경에 실패했습니다.';
      }
    } catch (e) {
      passwordError = e instanceof Error ? e.message : '비밀번호 변경 중 오류가 발생했습니다.';
    } finally {
      passwordLoading = false;
    }
  }

  // 프로필 수정
  function openProfileModal() {
    if (profile) {
      editGender = profile.gender as Gender;
      editAgeGroup = profile.ageGroup as AgeGroup;
    }
    showProfileModal = true;
    profileError = '';
    profileSuccess = '';
  }

  function closeProfileModal() {
    showProfileModal = false;
    profileError = '';
    profileSuccess = '';
  }

  async function handleUpdateProfile() {
    profileError = '';
    profileSuccess = '';
    profileLoading = true;

    try {
      const result = await updateProfile({ gender: editGender, ageGroup: editAgeGroup });
      if (result.success) {
        profileSuccess = '프로필이 수정되었습니다.';
        // 프로필 다시 불러오기
        if (profile) {
          profile = { ...profile, gender: editGender, ageGroup: editAgeGroup };
        }
        setTimeout(() => closeProfileModal(), 1500);
      } else {
        profileError = result.message || '프로필 수정에 실패했습니다.';
      }
    } catch (e) {
      profileError = e instanceof Error ? e.message : '프로필 수정 중 오류가 발생했습니다.';
    } finally {
      profileLoading = false;
    }
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

    <!-- 알림 설정 (네이티브 앱에서만 표시) -->
    {#if isNative}
    <section class="section">
      <h3 class="section-title">알림 설정</h3>
      <div class="group">
        <div class="row">
          <div class="row-content">
            <span class="row-label">푸시 알림</span>
            <span class="row-desc">앱 알림을 받습니다</span>
          </div>
          <button
            class="toggle"
            class:active={$pushSettings.enabled}
            on:click={() => handlePushToggle(!$pushSettings.enabled)}
            disabled={pushLoading}
          >
            <span class="toggle-knob"></span>
          </button>
        </div>

        {#if $pushSettings.enabled}
          <div class="row">
            <div class="row-content">
              <span class="row-label">속보 알림</span>
              <span class="row-desc">중요한 경제 뉴스를 빠르게 알려드립니다</span>
            </div>
            <button
              class="toggle"
              class:active={$pushSettings.breakingNews}
              on:click={() => handlePushSettingChange('breakingNews', !$pushSettings.breakingNews)}
            >
              <span class="toggle-knob"></span>
            </button>
          </div>

          <div class="row">
            <div class="row-content">
              <span class="row-label">북마크 업데이트</span>
              <span class="row-desc">저장한 이슈에 새 소식이 있을 때</span>
            </div>
            <button
              class="toggle"
              class:active={$pushSettings.bookmarkUpdates}
              on:click={() => handlePushSettingChange('bookmarkUpdates', !$pushSettings.bookmarkUpdates)}
            >
              <span class="toggle-knob"></span>
            </button>
          </div>

          <div class="row">
            <div class="row-content">
              <span class="row-label">급상승 이슈</span>
              <span class="row-desc">실시간 인기 이슈가 등장했을 때</span>
            </div>
            <button
              class="toggle"
              class:active={$pushSettings.trendingAlerts}
              on:click={() => handlePushSettingChange('trendingAlerts', !$pushSettings.trendingAlerts)}
            >
              <span class="toggle-knob"></span>
            </button>
          </div>

          <div class="row">
            <div class="row-content">
              <span class="row-label">오늘의 브리핑</span>
              <span class="row-desc">매일 아침 주요 경제 소식 요약</span>
            </div>
            <button
              class="toggle"
              class:active={$pushSettings.dailyBriefing}
              on:click={() => handlePushSettingChange('dailyBriefing', !$pushSettings.dailyBriefing)}
            >
              <span class="toggle-knob"></span>
            </button>
          </div>
        {/if}
      </div>
    </section>
    {/if}

    <!-- 계정 정보 -->
    <section class="section">
      <div class="section-header">
        <h3 class="section-title">계정 정보</h3>
        <button class="edit-btn" on:click={openProfileModal}>수정</button>
      </div>
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

    <!-- 보안 -->
    <section class="section">
      <h3 class="section-title">보안</h3>
      <div class="group">
        <button class="row link" on:click={openPasswordModal}>
          <span class="row-label">비밀번호 변경</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
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

<!-- 비밀번호 변경 모달 -->
{#if showPasswordModal}
  <div class="modal-backdrop" on:click={closePasswordModal} role="button" tabindex="-1" on:keydown={(e) => e.key === 'Escape' && closePasswordModal()}>
    <div class="modal modal-lg" on:click|stopPropagation role="dialog" aria-modal="true">
      <h2 class="modal-title">비밀번호 변경</h2>
      <p class="modal-desc">새 비밀번호는 8자 이상, 숫자와 특수문자를 포함해야 합니다.</p>

      <div class="modal-form">
        <div class="modal-field">
          <label for="currentPassword">현재 비밀번호</label>
          <input
            type="password"
            id="currentPassword"
            class="modal-input"
            bind:value={currentPassword}
            placeholder="현재 비밀번호"
            disabled={passwordLoading}
          />
        </div>

        <div class="modal-field">
          <label for="newPassword">새 비밀번호</label>
          <input
            type="password"
            id="newPassword"
            class="modal-input"
            bind:value={newPassword}
            placeholder="새 비밀번호"
            disabled={passwordLoading}
          />
          {#if newPassword}
            <div class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  style="width: {passwordStrength.level * 33.33}%; background: {passwordStrength.color}"
                ></div>
              </div>
              <span class="strength-label" style="color: {passwordStrength.color}">{passwordStrength.label}</span>
            </div>
          {/if}
        </div>

        <div class="modal-field">
          <label for="confirmPassword">새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            class="modal-input"
            bind:value={confirmPassword}
            placeholder="새 비밀번호 확인"
            disabled={passwordLoading}
          />
        </div>
      </div>

      {#if passwordError}
        <p class="modal-error">{passwordError}</p>
      {/if}

      {#if passwordSuccess}
        <p class="modal-success">{passwordSuccess}</p>
      {/if}

      <div class="modal-buttons">
        <button class="modal-btn cancel" on:click={closePasswordModal} disabled={passwordLoading}>
          취소
        </button>
        <button class="modal-btn primary" on:click={handleChangePassword} disabled={passwordLoading}>
          {passwordLoading ? '변경 중...' : '변경하기'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- 프로필 수정 모달 -->
{#if showProfileModal}
  <div class="modal-backdrop" on:click={closeProfileModal} role="button" tabindex="-1" on:keydown={(e) => e.key === 'Escape' && closeProfileModal()}>
    <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
      <h2 class="modal-title">프로필 수정</h2>

      <div class="modal-form">
        <div class="modal-field">
          <label>성별</label>
          <div class="radio-group">
            {#each genderOptions as opt}
              <label class="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  bind:group={editGender}
                  disabled={profileLoading}
                />
                <span class="radio-custom"></span>
                <span>{opt.label}</span>
              </label>
            {/each}
          </div>
        </div>

        <div class="modal-field">
          <label>연령대</label>
          <div class="select-wrapper">
            <select bind:value={editAgeGroup} disabled={profileLoading}>
              {#each ageGroupOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
            <svg class="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>

      {#if profileError}
        <p class="modal-error">{profileError}</p>
      {/if}

      {#if profileSuccess}
        <p class="modal-success">{profileSuccess}</p>
      {/if}

      <div class="modal-buttons">
        <button class="modal-btn cancel" on:click={closeProfileModal} disabled={profileLoading}>
          취소
        </button>
        <button class="modal-btn primary" on:click={handleUpdateProfile} disabled={profileLoading}>
          {profileLoading ? '저장 중...' : '저장하기'}
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

  .row-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .row-label {
    font-size: 17px;
    color: var(--text-primary);
  }

  .row-desc {
    font-size: 13px;
    color: var(--text-tertiary);
    line-height: 1.4;
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

  .toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .modal-btn.primary {
    background: var(--accent);
    color: white;
  }

  .modal-lg {
    max-width: 380px;
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .modal-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .modal-field label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    padding-left: var(--space-1);
  }

  .modal-field .modal-input {
    margin-bottom: 0;
  }

  .modal-success {
    font-size: 14px;
    color: var(--system-green);
    text-align: center;
    margin: 0 0 var(--space-4);
  }

  /* 비밀번호 강도 표시 */
  .password-strength {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }

  .strength-bar {
    flex: 1;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    transition: width 0.3s ease, background 0.3s ease;
  }

  .strength-label {
    font-size: 12px;
    font-weight: 600;
    min-width: 32px;
  }

  /* 섹션 헤더 */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--space-4);
  }

  .section-header .section-title {
    padding-left: 0;
  }

  .edit-btn {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    transition: opacity var(--duration-fast) var(--ease);
  }

  .edit-btn:active {
    opacity: 0.7;
  }

  /* 라디오 버튼 */
  .radio-group {
    display: flex;
    gap: var(--space-4);
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    font-size: 16px;
    color: var(--text-primary);
  }

  .radio-option input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-custom {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--duration-fast) var(--ease);
  }

  .radio-option input:checked + .radio-custom {
    border-color: var(--accent);
  }

  .radio-option input:checked + .radio-custom::after {
    content: '';
    width: 12px;
    height: 12px;
    background: var(--accent);
    border-radius: 50%;
  }

  /* 셀렉트 박스 */
  .select-wrapper {
    position: relative;
  }

  .select-wrapper select {
    width: 100%;
    padding: var(--space-4);
    padding-right: var(--space-10);
    background: var(--bg-secondary);
    border: none;
    border-radius: var(--radius);
    color: var(--text-primary);
    font-size: 16px;
    appearance: none;
    cursor: pointer;
  }

  .select-wrapper select:focus {
    outline: none;
    box-shadow: 0 0 0 4px var(--accent-glow);
  }

  .select-chevron {
    position: absolute;
    right: var(--space-4);
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--text-tertiary);
    pointer-events: none;
  }
</style>
