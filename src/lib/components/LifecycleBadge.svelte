<script lang="ts">
  import type { IssueLifecycle } from '$lib/types';
  import { getLifecycleInfo, formatLifecycleChange } from '$lib/utils/labels';

  export let lifecycle: IssueLifecycle | null | undefined;
  export let showChange: boolean = false;
  export let size: 'small' | 'medium' = 'small';
</script>

{#if lifecycle}
  {@const info = getLifecycleInfo(lifecycle.stage)}
  <div class="lifecycle-badge {size}" data-stage={lifecycle.stage}>
    <span class="emoji">{info.emoji}</span>
    <span class="label">{info.label}</span>
    {#if showChange}
      <span class="change">({formatLifecycleChange(lifecycle)})</span>
    {/if}
  </div>
{/if}

<style>
  .lifecycle-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-weight: 500;
    background: var(--card-hover);
    border: 1px solid var(--border);
  }

  .lifecycle-badge.small {
    font-size: 11px;
  }

  .lifecycle-badge.medium {
    font-size: 13px;
    padding: 4px 12px;
  }

  .emoji {
    font-size: 1em;
  }

  .label {
    color: var(--text-main);
  }

  .change {
    color: var(--text-sub);
    font-size: 0.9em;
  }

  /* Stage-specific styling */
  .lifecycle-badge[data-stage="EMERGING"] {
    background: rgba(251, 146, 60, 0.15);
    border-color: rgba(251, 146, 60, 0.3);
  }

  .lifecycle-badge[data-stage="SPREADING"] {
    background: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.3);
  }

  .lifecycle-badge[data-stage="PEAK"] {
    background: rgba(251, 191, 36, 0.15);
    border-color: rgba(251, 191, 36, 0.3);
  }

  .lifecycle-badge[data-stage="DECLINING"] {
    background: rgba(96, 165, 250, 0.15);
    border-color: rgba(96, 165, 250, 0.3);
  }

  .lifecycle-badge[data-stage="DORMANT"] {
    background: rgba(113, 113, 122, 0.15);
    border-color: rgba(113, 113, 122, 0.3);
  }
</style>
