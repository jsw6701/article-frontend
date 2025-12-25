export type IssueGroup = "RATE" | "FX" | "STOCK" | "REALESTATE" | "MACRO" | "POLICY";
export type CardStatus = "ACTIVE" | "STALE" | "FAILED";

export interface CardListItem {
  issueId: number;
  issueFingerprint: string;
  issueGroup: IssueGroup;
  issueTitle: string;
  headline?: string | null;        // 사용자용 제목 (사건 요약)
  signalSummary?: string | null;   // 리스트용 한 줄 요약 (왜 지금 중요한지)
  issueLastPublishedAt: string; // ISO
  cardStatus: CardStatus;
  cardUpdatedAt: string; // ISO
  conclusion?: string | null;
  cardJson?: any | null;
  articleCount: number;
  publisherCount: number;
  viewCount?: number;              // 조회수
}

export interface ArticleSummary {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string; // ISO
}

export interface CardDetail {
  issueId: number;
  issueFingerprint: string;
  issueGroup: IssueGroup;
  issueTitle: string;
  headline?: string | null;        // 사용자용 제목 (사건 요약)
  signalSummary?: string | null;   // 리스트용 한 줄 요약
  issueFirstPublishedAt: string;
  issueLastPublishedAt: string;
  cardStatus: CardStatus;
  cardUpdatedAt: string;
  cardJson: any;
  issueArticleCount: number;
  issuePublisherCount: number;
  articles: ArticleSummary[];
  viewCount?: number;              // 조회수
}

export interface PageResponse<T> {
  items: T[];
  count: number;
  limit: number;
  offset: number;
}

export interface TrendingItem {
  issueId: number;
  issueTitle: string;
  headline?: string | null;        // 사용자용 제목
  signalSummary?: string | null;   // 리스트용 한 줄 요약
  issueGroup: IssueGroup;
  articleCount: number;
  publisherCount: number;
  lastPublishedAt: string;
  score: number;
  conclusion: string | null;
  viewCount?: number;              // 조회수
}

export interface TrendingResponse {
  items: TrendingItem[];
  count: number;
  hours: number;
}

// ========== Auth Types ==========

export type Gender = "MALE" | "FEMALE";
export type AgeGroup = "TEENS" | "TWENTIES" | "THIRTIES" | "FORTIES" | "FIFTIES" | "SIXTIES_PLUS";

export interface SignUpRequest {
  username: string;
  password: string;
  gender: Gender;
  ageGroup: AgeGroup;
}

export interface SignUpResponse {
  success: boolean;
  userId: number | null;
  username: string | null;
  message: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  username: string | null;
  message: string | null;
}

export interface UsernameCheckResponse {
  available: boolean;
  message: string;
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  message: string | null;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  accessToken: string;
  refreshToken: string;
}

// ========== Bookmark Types ==========

export interface BookmarkItem {
  issueId: number;
  issueTitle: string;
  headline?: string | null;
  signalSummary?: string | null;
  issueGroup: IssueGroup;
  conclusion?: string | null;
  bookmarkedAt: string;
  viewCount?: number;              // 조회수
}

// ========== Popular Types ==========

export interface PopularCard {
  card: CardListItem;
  viewCount: number;
}

export interface PopularCardsResponse {
  items: PopularCard[];
  count: number;
}

export interface BookmarkStatusResponse {
  issueId: number;
  bookmarked: boolean;
}

export interface BookmarkListResponse {
  items: BookmarkItem[];
  count: number;
}
