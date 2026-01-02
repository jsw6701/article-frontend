export const groupLabels: Record<string, string> = {
  RATE: "금리",
  FX: "환율",
  STOCK: "주식",
  REALESTATE: "부동산",
  MACRO: "거시경제",
  POLICY: "정책"
};

export function getGroupLabel(group: string): string {
  return groupLabels[group] ?? group;
}

// ========== Gender & AgeGroup Labels ==========

export const genderLabels: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성"
};

export const ageGroupLabels: Record<string, string> = {
  TEENS: "10대",
  TWENTIES: "20대",
  THIRTIES: "30대",
  FORTIES: "40대",
  FIFTIES: "50대",
  SIXTIES_PLUS: "60대 이상"
};

export function getGenderLabel(gender: string): string {
  return genderLabels[gender] ?? gender;
}

export function getAgeGroupLabel(ageGroup: string): string {
  return ageGroupLabels[ageGroup] ?? ageGroup;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "방금";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

export function formatViewCount(count: number | undefined): string {
  if (!count) return "0";
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
  return count.toString();
}

// ========== Lifecycle Labels ==========
import type { IssueLifecycleStage, IssueLifecycle } from '$lib/types';

export const lifecycleLabels: Record<IssueLifecycleStage, { emoji: string; label: string; description: string }> = {
  EMERGING: { emoji: "🔥", label: "발생", description: "새롭게 떠오르는 이슈" },
  SPREADING: { emoji: "📈", label: "확산", description: "관심이 빠르게 증가 중" },
  PEAK: { emoji: "⚠️", label: "정점", description: "관심이 최고조에 달함" },
  DECLINING: { emoji: "📉", label: "소강", description: "관심이 줄어드는 중" },
  DORMANT: { emoji: "💤", label: "종료", description: "이슈가 마무리됨" }
};

export function getLifecycleInfo(stage: IssueLifecycleStage) {
  return lifecycleLabels[stage] ?? { emoji: "❓", label: stage, description: "" };
}

export function formatLifecycleChange(lifecycle: IssueLifecycle): string {
  const { stage, changePercent } = lifecycle;

  if (stage === "EMERGING") {
    return "신규 이슈";
  }

  if (stage === "PEAK") {
    return "정점 도달";
  }

  const sign = changePercent >= 0 ? "+" : "";
  return `정점 대비 ${sign}${changePercent}%`;
}
