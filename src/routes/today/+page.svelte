<script lang="ts">
  import type { CardListItem } from "$lib/types";
  import { todayCards } from "$lib/api";

  let items: CardListItem[] = [];
  let loading = true;
  let error: string | null = null;

  (async () => {
    try {
      const res = await todayCards(7);
      items = res.items;
    } catch (e: any) {
      error = e?.message ?? "Failed";
    } finally {
      loading = false;
    }
  })();
</script>

<h1>Today</h1>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
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
{/if}

<style>
  .error { color: #b00; }
  .list { display:flex; flex-direction:column; gap: 10px; margin-top: 12px; }
  .card { display:block; padding: 14px; border: 1px solid #eee; border-radius: 12px; text-decoration:none; color:#111; }
  .meta { display:flex; gap: 10px; align-items:center; color:#666; font-size: 12px; margin-bottom: 6px; }
  .tag { border: 1px solid #ddd; padding: 2px 8px; border-radius: 999px; }
  .desc { color:#444; margin: 6px 0 0; }
</style>
