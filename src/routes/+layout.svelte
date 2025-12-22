<div class="app">
  <header class="topbar">
    <a class="brand" href="/">Economy Briefing</a>
    <nav class="nav">
      <a href="/">Cards</a>
      <a href="/today">Today</a>
    </nav>
  </header>

  <main class="main">
    <slot />
  </main>
</div>

<style>
  .app { max-width: 920px; margin: 0 auto; padding: 16px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  .topbar { display:flex; justify-content:space-between; align-items:center; padding: 8px 0 16px; border-bottom: 1px solid #eee; }
  .brand { font-weight: 700; text-decoration:none; color: #111; }
  .nav a { margin-left: 12px; text-decoration:none; color:#333; }
  .main { padding-top: 16px; }
</style>
