<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    checkForUpdate,
    startFlexibleUpdate,
    completeFlexibleUpdate,
    addUpdateListener,
    FlexibleUpdateInstallStatus
  } from '$lib/utils/appUpdate';

  type UpdateState = 'idle' | 'available' | 'downloading' | 'downloaded' | 'installing';

  let state: UpdateState = 'idle';
  let downloadProgress = 0;
  let availableVersion = '';
  let listenerHandle: { remove: () => void } | null = null;

  onMount(async () => {
    // 업데이트 확인
    console.log('[AppUpdateBanner] Checking for updates...');
    const info = await checkForUpdate();
    console.log('[AppUpdateBanner] Update check result:', info);

    if (info.updateAvailable) {
      state = 'available';
      availableVersion = info.availableVersion || '';
      console.log('[AppUpdateBanner] Update available, showing banner');

      // 업데이트 상태 리스너 등록
      listenerHandle = await addUpdateListener((event) => {
        console.log('[AppUpdateBanner] Update state change:', event);
        switch (event.status) {
          case FlexibleUpdateInstallStatus.DOWNLOADING:
            state = 'downloading';
            if (event.bytesDownloaded && event.totalBytesToDownload) {
              downloadProgress = Math.round((event.bytesDownloaded / event.totalBytesToDownload) * 100);
              console.log('[AppUpdateBanner] Download progress:', downloadProgress + '%');
            }
            break;
          case FlexibleUpdateInstallStatus.DOWNLOADED:
            state = 'downloaded';
            downloadProgress = 100;
            console.log('[AppUpdateBanner] Download complete');
            break;
          case FlexibleUpdateInstallStatus.INSTALLING:
            state = 'installing';
            break;
          case FlexibleUpdateInstallStatus.INSTALLED:
            state = 'idle';
            break;
          case FlexibleUpdateInstallStatus.FAILED:
            console.error('[AppUpdateBanner] Update failed');
            state = 'available';
            break;
          case FlexibleUpdateInstallStatus.CANCELED:
            console.log('[AppUpdateBanner] Update canceled');
            state = 'available';
            break;
        }
      });
    }
  });

  onDestroy(() => {
    if (listenerHandle) {
      listenerHandle.remove();
    }
  });

  async function handleUpdate() {
    if (state === 'available') {
      console.log('[AppUpdateBanner] Starting flexible update...');
      state = 'downloading';
      const result = await startFlexibleUpdate();
      console.log('[AppUpdateBanner] startFlexibleUpdate result:', result);
      if (!result) {
        console.error('[AppUpdateBanner] Failed to start update');
        state = 'available';
      }
    } else if (state === 'downloaded') {
      console.log('[AppUpdateBanner] Completing update...');
      state = 'installing';
      await completeFlexibleUpdate();
    }
  }

  function dismiss() {
    state = 'idle';
  }
</script>

{#if state !== 'idle'}
  <div class="update-banner" class:downloading={state === 'downloading'}>
    <div class="content">
      {#if state === 'available'}
        <span class="message">새 버전이 있습니다{availableVersion ? ` (${availableVersion})` : ''}</span>
        <div class="actions">
          <button class="dismiss" on:click={dismiss}>나중에</button>
          <button class="update" on:click={handleUpdate}>업데이트</button>
        </div>
      {:else if state === 'downloading'}
        <span class="message">다운로드 중... {downloadProgress}%</span>
        <div class="progress-bar">
          <div class="progress" style="width: {downloadProgress}%"></div>
        </div>
      {:else if state === 'downloaded'}
        <span class="message">업데이트 준비 완료</span>
        <div class="actions">
          <button class="dismiss" on:click={dismiss}>나중에</button>
          <button class="update" on:click={handleUpdate}>지금 설치</button>
        </div>
      {:else if state === 'installing'}
        <span class="message">설치 중...</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .update-banner {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 500px;
    background: var(--accent);
    color: white;
    padding: var(--space-3) var(--space-4);
    padding-top: calc(var(--space-3) + env(safe-area-inset-top, 0px));
    z-index: 200;
    animation: slideDown 0.3s var(--ease);
  }

  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100%);
    }
    to {
      transform: translateX(-50%) translateY(0);
    }
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .message {
    font-size: 15px;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: var(--space-2);
  }

  .actions button {
    padding: var(--space-2) var(--space-3);
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius);
    transition: opacity var(--duration-fast) var(--ease);
  }

  .actions button:active {
    opacity: 0.7;
  }

  .dismiss {
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
  }

  .update {
    background: white;
    color: var(--accent);
  }

  .progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
    min-width: 100px;
  }

  .progress {
    height: 100%;
    background: white;
    border-radius: 2px;
    transition: width 0.3s var(--ease);
  }

  .downloading .content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
  }
</style>
