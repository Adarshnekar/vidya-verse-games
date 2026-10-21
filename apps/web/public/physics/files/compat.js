// VidyaVerse Physics Studio Simulation Compatibility & Dark Theme Layer
(() => {
  let _onload = null;
  try {
    Object.defineProperty(window, 'onload', {
      get() { return _onload; },
      set(fn) {
        _onload = fn;
        if (typeof fn === 'function') {
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(() => {
              try { fn(); } catch (e) { console.error("[VidyaVerse Physics] onload error:", e); }
            }, 40);
          } else {
            window.addEventListener('load', () => {
              try { fn(); } catch (e) { console.error("[VidyaVerse Physics] onload error:", e); }
            }, { once: true });
          }
        }
      },
      configurable: true
    });
  } catch (err) {
    console.warn("[VidyaVerse Physics] onload interceptor failed:", err);
  }

  // Apply dark theme defaults to match VidyaVerse
  const applyVidyaVerseTheme = () => {
    try {
      document.body.style.backgroundColor = '#070b14';
      document.body.style.color = '#f1f5f9';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Hide redundant internal topmenu
      const topMenu = document.getElementById('topmenu');
      if (topMenu) {
        topMenu.style.display = 'none';
      }
    } catch (e) {}
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', applyVidyaVerseTheme);
  } else {
    applyVidyaVerseTheme();
  }
})();
