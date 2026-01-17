import { Capacitor } from '@capacitor/core';
import type {
  CardDetail,
  CardListItem,
  IssueGroup,
  CardStatus,
  PageResponse,
  TrendingResponse,
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  LoginResponse,
  UsernameCheckResponse,
  RefreshResponse,
  LogoutResponse,
  BookmarkStatusResponse,
  BookmarkListResponse,
  PopularCardsResponse,
  SendEmailVerificationRequest,
  SendEmailVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  DashboardSummary,
  DailySignupStats,
  DailyViewStats,
  GenderStats,
  AgeGroupStats,
  AdminUserListResponse,
  UserRole,
  UserGrade,
  GradeInfo,
  GradeStats,
  MyProfile,
  MyProfileResponse,
  DeleteAccountResponse
} from "./types";

// ========== Error Types ==========

export type ApiErrorType =
  | 'NETWORK_ERROR'      // 네트워크 연결 실패
  | 'TIMEOUT'            // 요청 시간 초과
  | 'SERVER_ERROR'       // 500번대 서버 에러
  | 'AUTH_ERROR'         // 401/403 인증 에러
  | 'NOT_FOUND'          // 404
  | 'VALIDATION_ERROR'   // 400 유효성 검사 실패
  | 'UNKNOWN';           // 기타

export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  retryable: boolean;

  constructor(message: string, type: ApiErrorType, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.retryable = type === 'NETWORK_ERROR' || type === 'TIMEOUT' || type === 'SERVER_ERROR';
  }
}

// 에러 타입 판별
function classifyError(error: unknown, status?: number): ApiError {
  // fetch 실패 (네트워크 에러)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ApiError('네트워크 연결을 확인해주세요.', 'NETWORK_ERROR');
  }

  // AbortError (타임아웃)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('요청 시간이 초과되었습니다.', 'TIMEOUT');
  }

  // HTTP 상태 코드 기반
  if (status) {
    if (status === 401 || status === 403) {
      return new ApiError('인증이 필요합니다.', 'AUTH_ERROR', status);
    }
    if (status === 404) {
      return new ApiError('요청한 리소스를 찾을 수 없습니다.', 'NOT_FOUND', status);
    }
    if (status === 400) {
      return new ApiError('잘못된 요청입니다.', 'VALIDATION_ERROR', status);
    }
    if (status >= 500) {
      return new ApiError('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', 'SERVER_ERROR', status);
    }
  }

  // 기타 에러
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  return new ApiError(message, 'UNKNOWN', status);
}

// 온라인 상태 확인
// 참고: Capacitor 앱에서 navigator.onLine이 부정확할 수 있음
export function isOnline(): boolean {
  // Capacitor 네이티브 앱에서는 항상 true 반환 (실제 연결은 fetch에서 확인)
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// 온라인 상태 변경 리스너
export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * API Base URL을 동적으로 결정
 * 1. 환경변수 VITE_API_BASE가 설정되어 있으면 사용
 * 2. Capacitor 네이티브 앱이면 프로덕션 API URL 사용
 * 3. 웹 브라우저면 상대 경로 사용 (같은 도메인)
 */
function getApiBase(): string {
  // 1. 환경변수가 설정되어 있으면 우선 사용
  const envBase = import.meta.env.VITE_API_BASE;
  if (envBase) {
    return envBase;
  }

  // 2. Capacitor 네이티브 앱 (Android/iOS)인 경우
  if (Capacitor.isNativePlatform()) {
    return import.meta.env.VITE_NATIVE_API_BASE ?? "https://shift-dev.kr";
  }

  // 3. 웹 브라우저 - 같은 도메인에서 서빙되므로 상대 경로 사용
  return "";
}

const API_BASE = getApiBase();
const AUTH_STORAGE_KEY = "auth_user";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    return user?.accessToken ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    return user?.refreshToken ?? null;
  } catch {
    return null;
  }
}

function updateTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return;
  try {
    const user = JSON.parse(stored);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }
}

// 토큰 갱신 중인지 추적
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // 이미 갱신 중이면 기존 Promise 재사용
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    return false;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      if (data.success && data.accessToken && data.refreshToken) {
        updateTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// 요청 타임아웃 (15초)
const REQUEST_TIMEOUT = 15000;

async function http<T>(path: string, init?: RequestInit, requireAuth = false, retried = false): Promise<T> {
  // 오프라인 상태 체크
  if (!isOnline()) {
    throw new ApiError('인터넷에 연결되어 있지 않습니다.', 'NETWORK_ERROR');
  }

  const headers: Record<string, string> = { ...(init?.headers as Record<string, string> ?? {}) };

  // 인증이 필요한 요청에 토큰 자동 추가
  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // AbortController로 타임아웃 구현
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw classifyError(error);
  } finally {
    clearTimeout(timeoutId);
  }

  // 401 Unauthorized - 토큰 갱신 시도 후 재요청
  if (res.status === 401 && requireAuth && !retried) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // 토큰 갱신 성공 - 요청 재시도
      return http<T>(path, init, requireAuth, true);
    }
    // 토큰 갱신 실패 - 로그아웃
    clearAuth();
    throw new ApiError("인증이 만료되었습니다. 다시 로그인해주세요.", 'AUTH_ERROR', 401);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // 서버에서 보낸 에러 메시지 파싱 시도
    let serverMessage = "";
    try {
      const errorJson = JSON.parse(text);
      serverMessage = errorJson.message || errorJson.error || "";
    } catch {
      serverMessage = text;
    }

    const error = classifyError(null, res.status);
    if (serverMessage) {
      error.message = serverMessage;
    }
    throw error;
  }
  return (await res.json()) as T;
}

// 재시도 가능한 요청 래퍼
export async function httpWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1000
): Promise<T> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ApiError && error.retryable && attempt < maxRetries) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }

  throw lastError || new ApiError('요청에 실패했습니다.', 'UNKNOWN');
}

export function listCards(opts: {
  group?: IssueGroup;
  status?: CardStatus;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) {
  return http<PageResponse<CardListItem>>(
    `/api/cards${qs({
      group: opts.group,
      status: opts.status ?? "ACTIVE",
      from: opts.from,
      to: opts.to,
      limit: opts.limit ?? 20,
      offset: opts.offset ?? 0,
    })}`,
    undefined,
    true  // 인증 필요
  );
}

export function getCard(issueId: number) {
  return http<CardDetail>(`/api/cards/${issueId}`, undefined, true);
}

export function todayCards(limit = 7) {
  return http<PageResponse<CardListItem>>(`/api/cards/today${qs({ limit })}`, undefined, true);
}

export function getTrending(opts: { hours?: number; limit?: number } = {}) {
  return http<TrendingResponse>(
    `/api/trending${qs({
      hours: opts.hours ?? 3,
      limit: opts.limit ?? 10,
    })}`,
    undefined,
    true  // 인증 필요
  );
}

export function getPopularCards(opts: { limit?: number } = {}) {
  return http<PopularCardsResponse>(
    `/api/trending/popular${qs({
      limit: opts.limit ?? 10,
    })}`,
    undefined,
    true  // 인증 필요
  );
}

// ========== Auth API ==========

export function sendEmailVerification(request: SendEmailVerificationRequest) {
  return http<SendEmailVerificationResponse>("/api/auth/email/send-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function verifyEmail(request: VerifyEmailRequest) {
  return http<VerifyEmailResponse>("/api/auth/email/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function signUp(request: SignUpRequest) {
  return http<SignUpResponse>("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function login(request: LoginRequest) {
  return http<LoginResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function checkUsername(username: string) {
  return http<UsernameCheckResponse>(`/api/auth/check-username${qs({ username })}`);
}

export function refreshToken(refreshToken: string) {
  return http<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

export function logout(userId: number) {
  return http<LogoutResponse>("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

// ========== Password Reset API ==========

export interface PasswordResetEmailRequest {
  email: string;
}

export interface PasswordResetEmailResponse {
  success: boolean;
  message?: string;
  expireMinutes?: number;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

export function sendPasswordResetEmail(request: PasswordResetEmailRequest) {
  return http<PasswordResetEmailResponse>("/api/auth/password/send-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function resetPassword(request: ResetPasswordRequest) {
  return http<ResetPasswordResponse>("/api/auth/password/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

// ========== Terms Agreement API ==========

export interface TermsAgreementRequest {
  userId: number;
}

export interface TermsAgreementResponse {
  success: boolean;
  message?: string;
}

export function agreeToTerms(request: TermsAgreementRequest) {
  return http<TermsAgreementResponse>("/api/auth/terms/agree", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

// ========== Find Username API ==========

export interface FindUsernameRequest {
  email: string;
  code: string;
}

export interface FindUsernameResponse {
  success: boolean;
  username?: string;
  message?: string;
}

export function findUsername(request: FindUsernameRequest) {
  return http<FindUsernameResponse>("/api/auth/find-username", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

// ========== Settings API ==========

export interface UserSettingsData {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  startPage: 'home' | 'feed' | 'trending';
}

export async function getUserSettings(): Promise<UserSettingsData | null> {
  try {
    const res = await http<{ success: boolean; data: UserSettingsData | null }>("/api/users/settings", undefined, true);
    return res.data;
  } catch {
    return null;
  }
}

export function updateUserSettings(settings: UserSettingsData) {
  return http<{ success: boolean; message: string }>("/api/users/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  }, true);
}

// ========== Bookmark API ==========

export function addBookmark(issueId: number) {
  return http<{ success: boolean; message: string }>(`/api/bookmarks/${issueId}`, {
    method: "POST",
  }, true);
}

export function removeBookmark(issueId: number) {
  return http<{ success: boolean; message: string }>(`/api/bookmarks/${issueId}`, {
    method: "DELETE",
  }, true);
}

export function getBookmarkStatus(issueId: number) {
  return http<BookmarkStatusResponse>(`/api/bookmarks/${issueId}/status`, undefined, true);
}

export function getMyBookmarks() {
  return http<BookmarkListResponse>("/api/bookmarks", undefined, true);
}

// ========== Admin API ==========

export function getAdminDashboard() {
  return http<DashboardSummary>("/api/admin/dashboard", undefined, true);
}

export function getAdminSignupStats(days = 30) {
  return http<DailySignupStats[]>(`/api/admin/stats/signups${qs({ days })}`, undefined, true);
}

export function getAdminViewStats(days = 30) {
  return http<DailyViewStats[]>(`/api/admin/stats/views${qs({ days })}`, undefined, true);
}

export function getAdminGenderStats() {
  return http<GenderStats>("/api/admin/stats/gender", undefined, true);
}

export function getAdminAgeGroupStats() {
  return http<AgeGroupStats[]>("/api/admin/stats/age-groups", undefined, true);
}

export function getAdminUsers(opts: { page?: number; size?: number; search?: string } = {}) {
  return http<AdminUserListResponse>(
    `/api/admin/users${qs({
      page: opts.page ?? 1,
      size: opts.size ?? 20,
      search: opts.search,
    })}`,
    undefined,
    true
  );
}

export function updateUserRole(userId: number, role: UserRole) {
  return http<{ success: boolean; message: string }>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  }, true);
}

export function deleteUser(userId: number) {
  return http<{ success: boolean; message: string }>(`/api/admin/users/${userId}`, {
    method: "DELETE",
  }, true);
}

// ========== Grade APIs ==========

export function getAdminGrades() {
  return http<GradeInfo[]>("/api/admin/grades", undefined, true);
}

export function getAdminGradeStats() {
  return http<GradeStats[]>("/api/admin/stats/grades", undefined, true);
}

export function updateUserGrade(userId: number, grade: UserGrade) {
  return http<{ success: boolean; message: string }>(`/api/admin/users/${userId}/grade`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grade }),
  }, true);
}

// ========== User Profile API ==========

export async function getMyProfile(): Promise<MyProfile> {
  const response = await http<MyProfileResponse>("/api/users/me", undefined, true);
  if (!response.success || !response.data) {
    throw new Error(response.message || "프로필을 불러올 수 없습니다.");
  }
  return response.data;
}

export function deleteMyAccount(password: string) {
  return http<DeleteAccountResponse>("/api/users/me", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  }, true);
}

// ========== Password Change API ==========

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export function changePassword(request: ChangePasswordRequest) {
  return http<ChangePasswordResponse>("/api/users/me/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }, true);
}

// ========== Profile Update API ==========

export interface UpdateProfileRequest {
  gender: string;
  ageGroup: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
}

export function updateProfile(request: UpdateProfileRequest) {
  return http<UpdateProfileResponse>("/api/users/me/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }, true);
}

// ========== Push Notification API ==========

export interface PushTokenRequest {
  token: string;
  platform: 'android' | 'ios' | 'web';
}

export interface PushTokenResponse {
  success: boolean;
  message?: string;
}

export interface PushSettingsData {
  enabled: boolean;
  breakingNews: boolean;
  bookmarkUpdates: boolean;
  dailyBriefing: boolean;
  trendingAlerts: boolean;
}

export interface PushSettingsResponse {
  success: boolean;
  data?: PushSettingsData;
  message?: string;
}

// 푸시 토큰 등록
export function registerPushToken(token: string) {
  const platform = detectPlatform();
  return http<PushTokenResponse>("/api/push/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, platform }),
  }, true);
}

// 푸시 토큰 해제
export function unregisterPushToken(token: string) {
  return http<PushTokenResponse>("/api/push/token", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }, true);
}

// 푸시 설정 조회
export async function getPushSettings(): Promise<PushSettingsData | null> {
  try {
    const res = await http<PushSettingsResponse>("/api/push/settings", undefined, true);
    return res.data ?? null;
  } catch {
    return null;
  }
}

// 푸시 설정 업데이트
export function updatePushSettings(settings: PushSettingsData) {
  return http<PushSettingsResponse>("/api/push/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  }, true);
}

// 플랫폼 감지 (Capacitor 사용)
function detectPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';

  // Capacitor의 플랫폼 정보 사용 (더 정확함)
  const platform = Capacitor.getPlatform();
  if (platform === 'android') return 'android';
  if (platform === 'ios') return 'ios';
  return 'web';
}
