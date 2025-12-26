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
  VerifyEmailResponse
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
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

function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }
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

async function http<T>(path: string, init?: RequestInit, requireAuth = false): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string> ?? {}) };

  // 인증이 필요한 요청에 토큰 자동 추가
  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  // 401 Unauthorized - 로그아웃 처리
  if (res.status === 401 && requireAuth) {
    clearAuth();
    throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
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
