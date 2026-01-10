export type IssueGroup = "RATE" | "FX" | "STOCK" | "REALESTATE" | "MACRO" | "POLICY";
export type CardStatus = "ACTIVE" | "STALE" | "FAILED";

// ========== Issue Lifecycle Types ==========
export type IssueLifecycleStage = "EMERGING" | "SPREADING" | "PEAK" | "DECLINING" | "DORMANT";

export interface IssueLifecycle {
  stage: IssueLifecycleStage;
  changePercent: number;        // 정점 대비 변화율 (%)
  peakArticleCount: number;     // 정점 시점 기사 수
  currentArticleCount: number;  // 현재 기사 수 (최근 24시간)
  peakDate: string | null;      // 정점 도달 일시 (ISO)
  stageChangedAt: string;       // 현재 단계 진입 일시 (ISO)
}

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
  lifecycle?: IssueLifecycle | null; // 이슈 생애주기
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
  lifecycle?: IssueLifecycle | null; // 이슈 생애주기
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
  lifecycle?: IssueLifecycle | null; // 이슈 생애주기
}

export interface TrendingResponse {
  items: TrendingItem[];
  count: number;
  hours: number;
}

// ========== Auth Types ==========

export type Gender = "MALE" | "FEMALE";
export type AgeGroup = "TEENS" | "TWENTIES" | "THIRTIES" | "FORTIES" | "FIFTIES" | "SIXTIES_PLUS";
export type UserRole = "USER" | "ADMIN";

export interface SignUpRequest {
  username: string;
  password: string;
  email: string;
  gender: Gender;
  ageGroup: AgeGroup;
}

// ========== Email Verification Types ==========

export interface SendEmailVerificationRequest {
  email: string;
}

export interface SendEmailVerificationResponse {
  success: boolean;
  expireMinutes: number | null;
  message: string | null;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string | null;
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
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  username: string | null;
  role: UserRole | null;
  requiresTermsAgreement: boolean | null;
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
  role: UserRole;
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
  lifecycle?: IssueLifecycle | null; // 이슈 생애주기
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

// ========== Admin Types ==========

export interface DashboardSummary {
  totalUsers: number;
  todaySignups: number;
  totalViews: number;
  todayViews: number;
  totalCards: number;
  activeCards: number;
}

export interface DailySignupStats {
  date: string;
  count: number;
}

export interface DailyViewStats {
  date: string;
  count: number;
}

export interface GenderStats {
  male: number;
  female: number;
}

export interface AgeGroupStats {
  ageGroup: string;
  displayName: string;
  count: number;
}

// ========== Grade Types ==========

export type UserGrade = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface GradeInfo {
  grade: UserGrade;
  displayName: string;
  level: number;
  description: string;
}

export interface GradeStats {
  grade: string;
  displayName: string;
  level: number;
  count: number;
}

export interface AdminUserListItem {
  id: number;
  username: string;
  email: string;
  gender: string;
  ageGroup: string;
  role: string;
  grade: UserGrade;
  gradeDisplayName: string;
  gradeLevel: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ========== My Profile Types ==========

export interface MyProfile {
  id: number;
  username: string;
  email: string;
  gender: string;
  ageGroup: string;
  role: string;
  grade: string;
  gradeDisplayName: string;
  gradeLevel: number;
  emailVerified: boolean;
  createdAt: string;
  bookmarkCount: number;
}

export interface MyProfileResponse {
  success: boolean;
  data: MyProfile | null;
  message: string | null;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}
