export type IssueGroup = "RATE" | "FX" | "STOCK" | "REALESTATE" | "MACRO" | "POLICY";
export type CardStatus = "ACTIVE" | "STALE" | "FAILED";

export interface CardListItem {
  issueId: number;
  issueFingerprint: string;
  issueGroup: IssueGroup;
  issueTitle: string;
  issueLastPublishedAt: string; // ISO
  cardStatus: CardStatus;
  cardUpdatedAt: string; // ISO
  conclusion?: string | null;
  cardJson?: any | null; // 서버가 raw string이면 string으로 바꿔도 됨
}

export interface CardDetail {
  issueId: number;
  issueFingerprint: string;
  issueGroup: IssueGroup;
  issueTitle: string;
  issueFirstPublishedAt: string;
  issueLastPublishedAt: string;
  cardStatus: CardStatus;
  cardUpdatedAt: string;
  cardJson: any;
}

export interface PageResponse<T> {
  items: T[];
  count: number;
  limit: number;
  offset: number;
}
