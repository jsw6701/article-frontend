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
