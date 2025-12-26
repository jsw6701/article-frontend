<script lang="ts">
  interface Props {
    size?: "sm" | "md" | "lg" | "xl";
  }

  let { size = "md" }: Props = $props();
</script>

<span class="logo logo-{size}">
  <span class="letter accent" style="animation-delay: 0s">S</span>
  <span class="letter l-h" style="animation-delay: 0.05s">H</span>
  <span class="letter l-i" style="animation-delay: 0.1s">I</span>
  <span class="letter l-f" style="animation-delay: 0.15s">F</span>
  <span class="letter l-t" style="animation-delay: 0.2s">T</span>
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: baseline;
    font-weight: 800;
    letter-spacing: -0.02em;
    cursor: default;
    user-select: none;
    font-style: italic;
    transform: skewX(-6deg);
  }

  .logo-sm {
    font-size: 20px;
  }

  .logo-md {
    font-size: 28px;
  }

  .logo-lg {
    font-size: 40px;
  }

  .logo-xl {
    font-size: 56px;
  }

  .letter {
    display: inline-block;
    color: var(--text-main);
    transform: scaleX(0.9);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .letter.accent {
    color: var(--accent-shift);
  }

  .l-h {
    margin-left: -0.02em;
  }

  .l-t {
    margin-left: -0.02em;
  }

  .logo:hover .letter {
    animation: flip 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes flip {
    0% {
      transform: scaleX(0.9) rotateX(0deg);
    }
    50% {
      transform: scaleX(0.9) rotateX(-90deg) scale(1.05);
    }
    100% {
      transform: scaleX(0.9) rotateX(0deg);
    }
  }
</style>
