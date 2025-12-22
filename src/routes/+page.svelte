<script lang="ts">
  import type { CardListItem, IssueGroup } from "$lib/types";
  import { listCards } from "$lib/api";

  const groups: { label: string; value?: IssueGroup }[] = [
    { label: "All", value: undefined },
    { label: "RATE", value: "RATE" },
    { label: "FX", value: "FX" },
    { label: "STOCK", value: "STOCK" },
    { label: "REALESTATE", value: "REALESTATE" },
    { label: "MACRO", value: "MACRO" },
    { label: "POLICY", value: "POLICY" }
  ];

  let group: IssueGroup | undefined = undefined;
  let items: CardListItem[] = [];
  let loading = false;
  let error: string | null = null;

  let limit = 20;
  let offset = 0;
  let hasMore = true;

  async function load(reset = false) {
    if (loading) return;
    loading = true;
    error = null;

    try {
      if (reset) {
        items = [];
        offset = 0;
        hasMore = true;
      }

      const res = await listCards({ group, limit, offset });
      items = [...items, ...res.items];
      offset += res.items.length;
      hasMore = res.items.length === limit;
    } catch (e: any) {
      error = e?.message ?? "Failed to load";
    } finally {
      loading = false;
    }
  }

  load(true);

  function onChangeGroup(v?: IssueGroup) {
    group = v;
    load(true);
  }
</script>

<section class="controls">
  <label>Group</label>
  <select on:change={(e) => onChangeGroup(((e.currentTarget as HTMLSelectElement).value || undefined) as any)}>
    {#each groups as g}
      <option value={g.value ?? ""} selected={g.value === group}>{g.label}</option>
    {/each}
  </select>
</section>

{#if error}
  <p class="error">{error}</p>
{/if}

<section class="list">
  {#each items as it}
    <a class="card" href={`/cards/${it.issueId}`}>
      <div class="meta">
        <span class="tag">{it.issueGroup}</span>
        <span class="date">{new Date(it.issueLastPublishedAt).toLocaleString()}</span>
      </div>
      <h3>{it.issueTitle}</h3>
      <p class="desc">{it.conclusion ?? "내용을 불러오는 중..."}</p>
    </a>
  {/each}
</section>

<div class="footer">
  {#if hasMore}
    <button disabled={loading} on:click={() => load(false)}>
      {loading ? "Loading..." : "Load more"}
    </button>
  {:else}
    <p class="muted">No more</p>
  {/if}
</div>

<style>
  .controls { display:flex; gap: 10px; align-items:center; margin-bottom: 12px; }
  select { padding: 6px 10px; }
  .error { color: #b00; }
  .list { display:flex; flex-direction:column; gap: 10px; }
  .card { display:block; padding: 14px; border: 1px solid #eee; border-radius: 12px; text-decoration:none; color: #111; }
  .meta { display:flex; gap: 10px; align-items:center; color:#666; font-size: 12px; margin-bottom: 6px; }
  .tag { border: 1px solid #ddd; padding: 2px 8px; border-radius: 999px; }
  .desc { color:#444; margin: 6px 0 0; }
  .footer { margin-top: 14px; }
  button { padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; background: #fff; cursor:pointer; }
  .muted { color:#777; }
</style>
