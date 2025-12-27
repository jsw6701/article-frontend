<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { AdminUserListItem, AdminUserListResponse, UserRole } from '$lib/types';
  import { getAdminUsers, updateUserRole, deleteUser } from '$lib/api';
  import { isLoggedIn, isAdmin, currentUser } from '$lib/stores/auth';

  let users: AdminUserListItem[] = [];
  let total = 0;
  let page = 1;
  let size = 20;
  let totalPages = 0;
  let search = '';
  let searchInput = '';

  let loading = true;
  let error: string | null = null;
  let actionLoading: number | null = null; // userId being acted upon

  // 모달 상태
  let showDeleteModal = false;
  let deleteTarget: AdminUserListItem | null = null;

  let currentUserId: number | null = null;

  onMount(() => {
    const userUnsubscribe = currentUser.subscribe((user) => {
      currentUserId = user?.userId ?? null;
    });

    const unsubscribe = isLoggedIn.subscribe(async (loggedIn) => {
      if (loggedIn) {
        const adminUnsubscribe = isAdmin.subscribe(async (admin) => {
          if (!admin) {
            goto(`${base}/`);
            return;
          }
          await loadUsers();
          adminUnsubscribe();
        });
        unsubscribe();
      }
    });

    return () => {
      unsubscribe();
      userUnsubscribe();
    };
  });

  async function loadUsers() {
    loading = true;
    error = null;
    try {
      const res = await getAdminUsers({ page, size, search: search || undefined });
      users = res.items;
      total = res.total;
      totalPages = res.totalPages;
    } catch (e: any) {
      error = e?.message ?? '데이터를 불러오는데 실패했습니다';
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    search = searchInput;
    page = 1;
    loadUsers();
  }

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    page = newPage;
    loadUsers();
  }

  async function handleRoleChange(user: AdminUserListItem) {
    if (actionLoading) return;
    if (user.id === currentUserId) {
      alert('자신의 권한은 변경할 수 없습니다.');
      return;
    }

    const newRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMsg = newRole === 'ADMIN'
      ? `${user.username}님을 관리자로 변경하시겠습니까?`
      : `${user.username}님의 관리자 권한을 해제하시겠습니까?`;

    if (!confirm(confirmMsg)) return;

    actionLoading = user.id;
    try {
      await updateUserRole(user.id, newRole);
      // 목록 갱신
      users = users.map(u =>
        u.id === user.id ? { ...u, role: newRole } : u
      );
    } catch (e: any) {
      alert(e?.message ?? '권한 변경에 실패했습니다');
    } finally {
      actionLoading = null;
    }
  }

  function openDeleteModal(user: AdminUserListItem) {
    if (user.id === currentUserId) {
      alert('자신의 계정은 삭제할 수 없습니다.');
      return;
    }
    deleteTarget = user;
    showDeleteModal = true;
  }

  function closeDeleteModal() {
    showDeleteModal = false;
    deleteTarget = null;
  }

  async function handleDelete() {
    if (!deleteTarget || actionLoading) return;

    actionLoading = deleteTarget.id;
    try {
      await deleteUser(deleteTarget.id);
      // 목록에서 제거
      users = users.filter(u => u.id !== deleteTarget!.id);
      total -= 1;
      closeDeleteModal();
    } catch (e: any) {
      alert(e?.message ?? '삭제에 실패했습니다');
    } finally {
      actionLoading = null;
    }
  }

  function getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'role-admin' : 'role-user';
  }
</script>

<div class="admin-page">
  <header class="page-header">
    <h1>유저 관리</h1>
    <nav class="admin-nav">
      <a href="{base}/admin" class="nav-item">대시보드</a>
      <a href="{base}/admin/users" class="nav-item active">유저 관리</a>
    </nav>
  </header>

  <!-- 검색 -->
  <div class="search-bar">
    <input
      type="text"
      placeholder="아이디로 검색..."
      bind:value={searchInput}
      on:keypress={(e) => e.key === 'Enter' && handleSearch()}
    />
    <button on:click={handleSearch}>검색</button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button on:click={loadUsers}>다시 시도</button>
    </div>
  {:else}
    <!-- 결과 정보 -->
    <div class="result-info">
      <span>총 {total}명</span>
      {#if search}
        <span class="search-tag">"{search}" 검색 결과</span>
      {/if}
    </div>

    <!-- 유저 리스트 -->
    <div class="user-list">
      {#each users as user}
        <div class="user-card">
          <div class="user-main">
            <div class="user-info">
              <span class="user-name">{user.username}</span>
              <span class="role-badge {getRoleBadgeClass(user.role)}">{user.role}</span>
            </div>
            <div class="user-details">
              <span>{user.gender}</span>
              <span>{user.ageGroup}</span>
              <span class="email-verified" class:verified={user.emailVerified}>
                {user.emailVerified ? '인증됨' : '미인증'}
              </span>
            </div>
            <div class="user-meta">
              <span>가입일: {user.createdAt}</span>
            </div>
          </div>
          <div class="user-actions">
            <button
              class="btn-role"
              class:loading={actionLoading === user.id}
              on:click={() => handleRoleChange(user)}
              disabled={actionLoading === user.id || user.id === currentUserId}
            >
              {user.role === 'ADMIN' ? '관리자 해제' : '관리자 지정'}
            </button>
            <button
              class="btn-delete"
              on:click={() => openDeleteModal(user)}
              disabled={actionLoading === user.id || user.id === currentUserId}
            >
              삭제
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- 페이지네이션 -->
    {#if totalPages > 1}
      <div class="pagination">
        <button
          class="page-btn"
          disabled={page === 1}
          on:click={() => goToPage(page - 1)}
        >
          이전
        </button>
        <span class="page-info">{page} / {totalPages}</span>
        <button
          class="page-btn"
          disabled={page === totalPages}
          on:click={() => goToPage(page + 1)}
        >
          다음
        </button>
      </div>
    {/if}
  {/if}
</div>

<!-- 삭제 확인 모달 -->
{#if showDeleteModal && deleteTarget}
  <div class="modal-overlay" on:click={closeDeleteModal}>
    <div class="modal" on:click|stopPropagation>
      <h3>사용자 삭제</h3>
      <p><strong>{deleteTarget.username}</strong> 계정을 정말 삭제하시겠습니까?</p>
      <p class="warning">이 작업은 되돌릴 수 없습니다.</p>
      <div class="modal-actions">
        <button class="btn-cancel" on:click={closeDeleteModal}>취소</button>
        <button
          class="btn-confirm-delete"
          on:click={handleDelete}
          disabled={actionLoading !== null}
        >
          {actionLoading ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .admin-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .page-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0;
  }

  .admin-nav {
    display: flex;
    gap: var(--space-2);
  }

  .nav-item {
    padding: var(--space-2) var(--space-3);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-sub);
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.15s;
  }

  .nav-item:hover {
    color: var(--text-main);
    border-color: var(--border-light);
  }

  .nav-item.active {
    color: var(--accent);
    border-color: var(--accent);
  }

  /* 검색 */
  .search-bar {
    display: flex;
    gap: var(--space-2);
  }

  .search-bar input {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    font-size: 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-main);
  }

  .search-bar input::placeholder {
    color: var(--text-sub);
  }

  .search-bar button {
    padding: var(--space-2) var(--space-4);
    font-size: 14px;
    font-weight: 500;
    background: var(--accent);
    color: white;
    border-radius: var(--radius);
  }

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

  .error button {
    margin-top: var(--space-3);
    padding: var(--space-2) var(--space-4);
    background: var(--accent);
    color: white;
    font-size: 13px;
    font-weight: 500;
    border-radius: var(--radius);
  }

  /* 결과 정보 */
  .result-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 13px;
    color: var(--text-sub);
  }

  .search-tag {
    padding: 2px 8px;
    background: var(--card-hover);
    border-radius: var(--radius);
  }

  /* 유저 리스트 */
  .user-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .user-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .user-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .user-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
  }

  .role-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius);
  }

  .role-badge.role-admin {
    background: var(--accent);
    color: white;
  }

  .role-badge.role-user {
    background: var(--card-hover);
    color: var(--text-sub);
  }

  .user-details {
    display: flex;
    gap: var(--space-2);
    font-size: 13px;
    color: var(--text-sub);
  }

  .user-details span:not(:last-child)::after {
    content: "·";
    margin-left: var(--space-2);
  }

  .email-verified {
    color: var(--text-sub);
  }

  .email-verified.verified {
    color: #10b981;
  }

  .user-meta {
    font-size: 12px;
    color: var(--text-sub);
  }

  .user-actions {
    display: flex;
    gap: var(--space-2);
  }

  .btn-role {
    flex: 1;
    padding: var(--space-2);
    font-size: 13px;
    font-weight: 500;
    background: var(--card-hover);
    color: var(--text-main);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.15s;
  }

  .btn-role:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }

  .btn-role:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-delete {
    padding: var(--space-2) var(--space-3);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    color: #ef4444;
    border: 1px solid #ef4444;
    border-radius: var(--radius);
    transition: all 0.15s;
  }

  .btn-delete:hover:not(:disabled) {
    background: #ef4444;
    color: white;
  }

  .btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 페이지네이션 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) 0;
  }

  .page-btn {
    padding: var(--space-2) var(--space-3);
    font-size: 13px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-main);
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-info {
    font-size: 13px;
    color: var(--text-sub);
  }

  /* 모달 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-4);
  }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    max-width: 400px;
    width: 100%;
  }

  .modal h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 var(--space-3);
  }

  .modal p {
    font-size: 14px;
    color: var(--text-body);
    margin: 0 0 var(--space-2);
  }

  .modal .warning {
    font-size: 13px;
    color: #ef4444;
  }

  .modal-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  .btn-cancel {
    flex: 1;
    padding: var(--space-2);
    font-size: 14px;
    background: var(--card-hover);
    color: var(--text-main);
    border-radius: var(--radius);
  }

  .btn-confirm-delete {
    flex: 1;
    padding: var(--space-2);
    font-size: 14px;
    font-weight: 500;
    background: #ef4444;
    color: white;
    border-radius: var(--radius);
  }

  .btn-confirm-delete:disabled {
    opacity: 0.7;
  }
</style>
