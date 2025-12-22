<script lang="ts">
  import { onMount } from "svelte";
  import { getCard } from "$lib/api";
  import type { CardDetail } from "$lib/types";

  export let params: { issueId: string };

  let detail: CardDetail | null = null;
  let card: any = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      detail = await getCard(Number(params.issueId));

      // cardJson이 string이면 파싱
      const raw = detail.cardJson;
      card = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e: any) {
      error = e?.message ?? "Failed to load";
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if detail}
  <a class="back" href="/">← Back</a>

  <header class="hdr">
    <div class="meta">
      <span class="tag">{detail.issueGroup}</span>
      <span class="date">{new Date(detail.issueLastPublishedAt).toLocaleString()}</span>
    </div>
    <h1>{detail.issueTitle}</h1>
  </header>

  <section class="box">
    <h2>Conclusion</h2>
    <p>{card?.conclusion ?? "-"}</p>
  </section>

  <section class="box">
    <h2>Why it matters</h2>
    <p>{card?.why_it_matters ?? "-"}</p>
  </section>

  <section class="box">
    <h2>Evidence</h2>
    <ul>
      {#each (card?.evidence ?? []) as ev}
        <li><b>{ev.source}</b> — {ev.fact}</li>
      {/each}
    </ul>
  </section>

  <section class="box">
    <h2>Counter scenario</h2>
    <p>{card?.counter_scenario ?? "-"}</p>
  </section>

  <section class="box">
    <h2>Impact</h2>
    <p><b>{card?.impact?.score ?? "-"}</b> / 5 — {card?.impact?.reason ?? "-"}</p>
  </section>

  <section class="box">
    <h2>Action guide</h2>
    <p>{card?.action_guide ?? "-"}</p>
  </section>
{/if}

<style>
  .error { color: #b00; }
  .back { display:inline-block; margin-bottom: 10px; text-decoration:none; color:#333; }
  .hdr { margin-bottom: 14px; }
  .meta { display:flex; gap: 10px; align-items:center; color:#666; font-size: 12px; margin-bottom: 6px; }
  .tag { border: 1px solid #ddd; padding: 2px 8px; border-radius: 999px; }
  .box { padding: 14px; border: 1px solid #eee; border-radius: 12px; margin: 10px 0; }
  h1 { margin: 6px 0 0; }
  h2 { margin: 0 0 8px; font-size: 16px; }
  ul { margin: 0; padding-left: 18px; }
</style>
