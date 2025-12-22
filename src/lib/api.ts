import type { CardDetail, CardListItem, IssueGroup, CardStatus, PageResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}) },
  });
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
    })}`
  );
}

export function getCard(issueId: number) {
  return http<CardDetail>(`/api/cards/${issueId}`);
}

export function todayCards(limit = 7) {
  return http<PageResponse<CardListItem>>(`/api/cards/today${qs({ limit })}`);
}
