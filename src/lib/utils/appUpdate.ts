import { Capacitor } from '@capacitor/core';
import { AppUpdate, AppUpdateAvailability, FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion?: string;
  availableVersion?: string;
}

/**
 * 앱 업데이트 가능 여부 확인
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  // 네이티브 앱이 아니면 스킵
  if (!Capacitor.isNativePlatform()) {
    console.log('[AppUpdate] Not a native platform, skipping update check');
    return { updateAvailable: false };
  }

  try {
    const info = await AppUpdate.getAppUpdateInfo();

    console.log('[AppUpdate] Update info:', {
      updateAvailability: info.updateAvailability,
      availableVersionName: info.availableVersionName,
      currentVersionName: info.currentVersionName,
      availableVersionCode: info.availableVersionCode,
      currentVersionCode: info.currentVersionCode,
    });

    const updateAvailable = info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE;

    console.log('[AppUpdate] Update available:', updateAvailable);

    return {
      updateAvailable,
      currentVersion: info.currentVersionName,
      availableVersion: info.availableVersionName
    };
  } catch (error) {
    console.error('[AppUpdate] Failed to check for update:', error);
    return { updateAvailable: false };
  }
}

/**
 * 유연한 업데이트 시작 (백그라운드 다운로드)
 */
export async function startFlexibleUpdate(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AppUpdate] Not native platform, skipping');
    return false;
  }

  try {
    console.log('[AppUpdate] Calling startFlexibleUpdate...');
    const result = await AppUpdate.startFlexibleUpdate();
    console.log('[AppUpdate] startFlexibleUpdate response:', result);
    return true;
  } catch (error) {
    console.error('[AppUpdate] Failed to start flexible update:', error);
    return false;
  }
}

/**
 * 다운로드 완료된 업데이트 설치
 */
export async function completeFlexibleUpdate(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await AppUpdate.completeFlexibleUpdate();
  } catch (error) {
    console.error('Failed to complete flexible update:', error);
  }
}

/**
 * 유연한 업데이트 상태 리스너 추가
 */
export function addUpdateListener(
  callback: (status: { status: FlexibleUpdateInstallStatus; bytesDownloaded?: number; totalBytesToDownload?: number }) => void
): Promise<{ remove: () => void }> {
  return AppUpdate.addListener('onFlexibleUpdateStateChange', callback);
}

/**
 * 업데이트 상태 상수
 */
export { FlexibleUpdateInstallStatus } from '@capawesome/capacitor-app-update';
