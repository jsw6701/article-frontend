<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { IssueGroup } from '$lib/types';
  import { getGroupLabel } from '$lib/utils/labels';

  export let selectedGroup: IssueGroup | null = null;

  const dispatch = createEventDispatcher<{
    change: IssueGroup | null;
  }>();

  const groups: (IssueGroup | null)[] = [
    null,      // 전체
    'RATE',    // 금리
    'FX',      // 환율
    'STOCK',   // 주식
    'REALESTATE', // 부동산
    'MACRO',   // 거시지표
    'POLICY'   // 정책
  ];

  function handleSelect(group: IssueGroup | null) {
    selectedGroup = group;
    dispatch('change', group);
  }

  function getLabel(group: IssueGroup | null): string {
    return group ? getGroupLabel(group) : '전체';
  }

  function getGroupColor(group: IssueGroup | null): string {
    if (!group) return 'var(--accent)';
    const colors: Record<IssueGroup, string> = {
      RATE: 'var(--g-rate)',
      FX: 'var(--g-fx)',
      STOCK: 'var(--g-stock)',
      REALESTATE: 'var(--g-realestate)',
      MACRO: 'var(--g-macro)',
      POLICY: 'var(--g-policy)'
    };
    return colors[group];
  }
</script>

<div class="filter-chips">
  {#each groups as group}
    <button
      class="chip"
      class:active={selectedGroup === group}
      style="--chip-color: {getGroupColor(group)}"
      on:click={() => handleSelect(group)}
    >
      {getLabel(group)}
    </button>
  {/each}
</div>

<style>
  .filter-chips {
    display: flex;
    gap: var(--space-2);
    overflow-x: auto;
    padding: var(--space-1) 0;
    margin: 0 calc(-1 * var(--space-4));
    padding-left: var(--space-4);
    padding-right: var(--space-4);
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
  }

  .filter-chips::-webkit-scrollbar {
    display: none;
  }

  .chip {
    flex-shrink: 0;
    padding: var(--space-2) var(--space-4);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    transition: all var(--duration-fast) var(--ease);
    white-space: nowrap;
  }

  .chip:active {
    transform: scale(0.95);
  }

  .chip.active {
    color: white;
    background: var(--chip-color);
    font-weight: 600;
  }
</style>
