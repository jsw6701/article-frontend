<script lang="ts">
  import { base } from '$app/paths';
  import { createEventDispatcher } from 'svelte';
  import { agreeToTerms } from '$lib/api';

  export let userId: number;
  export let show = false;

  const dispatch = createEventDispatcher<{
    agreed: void;
    close: void;
  }>();

  let agreeTerms = false;
  let agreePrivacy = false;
  let loading = false;
  let error = '';

  $: canSubmit = agreeTerms && agreePrivacy && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;

    loading = true;
    error = '';

    try {
      const res = await agreeToTerms({ userId });
      if (res.success) {
        dispatch('agreed');
      } else {
        error = res.message || '약관 동의 처리에 실패했습니다.';
      }
    } catch (e) {
      error = '서버 오류가 발생했습니다.';
    } finally {
      loading = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    // 모달 외부 클릭 시 닫지 않음 (필수 동의이므로)
  }
</script>

{#if show}
  <div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h2 id="modal-title">약관 동의 필요</h2>
        <p class="modal-desc">서비스 이용을 위해 약관에 동의해 주세요.</p>
      </div>

      <div class="modal-body">
        <div class="agreement-item">
          <label class="agreement-label">
            <input type="checkbox" bind:checked={agreeTerms} />
            <span class="checkbox-custom"></span>
            <span class="agreement-text">
              <a href="{base}/terms" target="_blank" rel="noopener noreferrer">서비스 이용약관</a>
              <span class="required">(필수)</span>
            </span>
          </label>
        </div>

        <div class="agreement-item">
          <label class="agreement-label">
            <input type="checkbox" bind:checked={agreePrivacy} />
            <span class="checkbox-custom"></span>
            <span class="agreement-text">
              <a href="{base}/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a>
              <span class="required">(필수)</span>
            </span>
          </label>
        </div>

        <button
          type="button"
          class="agree-all-btn"
          on:click={() => { agreeTerms = true; agreePrivacy = true; }}
        >
          전체 동의
        </button>

        {#if error}
          <div class="error">{error}</div>
        {/if}
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="submit-btn"
          disabled={!canSubmit}
          on:click={handleSubmit}
        >
          {loading ? '처리 중...' : '동의하고 계속하기'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-4);
  }

  .modal {
    background: var(--card);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    padding: var(--space-6) var(--space-6) var(--space-4);
    text-align: center;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .modal-desc {
    font-size: 15px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .modal-body {
    padding: var(--space-5) var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .agreement-item {
    display: flex;
    align-items: flex-start;
  }

  .agreement-label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    width: 100%;
  }

  .agreement-label input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkbox-custom {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid var(--border);
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--duration-fast) var(--ease);
  }

  .agreement-label input:checked + .checkbox-custom {
    background: var(--accent);
    border-color: var(--accent);
  }

  .agreement-label input:checked + .checkbox-custom::after {
    content: '';
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-bottom: 2px;
  }

  .agreement-text {
    font-size: 15px;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .agreement-text a {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .required {
    color: var(--system-red);
    font-size: 13px;
    margin-left: var(--space-1);
  }

  .agree-all-btn {
    padding: var(--space-3);
    font-size: 15px;
    font-weight: 600;
    color: var(--accent);
    background: var(--bg-secondary);
    border: 1px solid var(--accent);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease);
    margin-top: var(--space-2);
  }

  .agree-all-btn:active {
    background: var(--accent);
    color: white;
  }

  .error {
    font-size: 14px;
    color: var(--system-red);
    padding: var(--space-3);
    background: rgba(255, 59, 48, 0.1);
    border-radius: var(--radius);
    text-align: center;
    line-height: 1.4;
  }

  .modal-footer {
    padding: var(--space-4) var(--space-6) var(--space-6);
  }

  .submit-btn {
    width: 100%;
    padding: var(--space-4);
    font-size: 17px;
    font-weight: 600;
    color: white;
    background: var(--accent);
    border-radius: var(--radius);
    cursor: pointer;
    transition: opacity var(--duration-fast) var(--ease);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .submit-btn:not(:disabled):active {
    opacity: 0.8;
  }
</style>
