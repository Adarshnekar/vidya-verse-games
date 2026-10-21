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

  // Inject High-Specificity VidyaVerse Theme Styles
  const injectThemeStyles = () => {
    if (document.getElementById('vidyaverse-physics-theme')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'vidyaverse-physics-theme';
    styleEl.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }

      body {
        background-color: #070b14 !important;
        color: #F0F0FA !important;
        overflow: hidden !important;
        user-select: none !important;
      }

      /* Hide redundant internal topmenu headers */
      #topmenu {
        display: none !important;
      }

      /* VidyaVerse Studio Glassmorphic Container Panels */
      #menu {
        background: rgba(22, 22, 36, 0.9) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1px solid #2A2A3E !important;
        border-radius: 14px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
        padding: 12px 16px !important;
        color: #F0F0FA !important;
        max-width: calc(100% - 28px) !important;
        left: 14px !important;
        bottom: 14px !important;
        z-index: 100 !important;
      }

      #sidemenu {
        background: rgba(22, 22, 36, 0.9) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1px solid #2A2A3E !important;
        border-radius: 14px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
        padding: 14px !important;
        color: #F0F0FA !important;
        max-width: 320px !important;
        top: 14px !important;
        left: 14px !important;
        z-index: 100 !important;
      }

      #menu a, #menu span, #menu label, #menu div {
        color: #9D9DB5 !important;
      }

      #element-el, #message-el {
        display: inline-block !important;
        color: #F0F0FA !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        margin: 6px 0 !important;
      }

      /* ===================================================
         VIDYAVERSE BUTTON & APPARATUS SELECTOR THEME
         =================================================== */
      button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 6px 14px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        letter-spacing: 0.02em !important;
        text-transform: uppercase !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
        outline: none !important;
        margin: 4px 6px 4px 0 !important;
        background: #26233E !important;
        color: #C4B5FD !important;
        border: 1px solid rgba(124, 92, 250, 0.3) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
      }

      button:hover {
        background: #6541F5 !important;
        color: #FFFFFF !important;
        border-color: #7C5CFA !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 14px rgba(101, 65, 245, 0.4) !important;
      }

      button:active {
        transform: translateY(0px) !important;
      }

      /* ACTIVE APPARATUS SELECTOR BUTTONS
         Matches selected tabs in VidyaVerse Brand Palette */
      button[data-selected="true"],
      button[style*="67, 97"],
      button[style*="rgb(3, 67, 97)"],
      button.active {
        background: #6541F5 !important;
        color: #FFFFFF !important;
        border: 1px solid #7C5CFA !important;
        box-shadow: 0 0 16px rgba(101, 65, 245, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4) !important;
        font-weight: 700 !important;
      }

      /* INACTIVE APPARATUS SELECTOR BUTTONS
         Matches inactive surface cards in VidyaVerse Theme */
      button[data-selected="false"],
      button[style*="108, 156"],
      button[style*="rgb(3, 108, 156)"] {
        background: #1C1C2A !important;
        color: #9D9DB5 !important;
        border: 1px solid #2A2A3E !important;
        box-shadow: none !important;
        font-weight: 500 !important;
      }

      button[data-selected="false"]:hover,
      button[style*="108, 156"]:hover,
      button[style*="rgb(3, 108, 156)"]:hover {
        background: #26233E !important;
        color: #F0F0FA !important;
        border-color: #6541F5 !important;
      }

      /* Danger / Stop Buttons */
      #reset-el, #stop-el, button[id*="reset"], button[id*="stop"] {
        background: rgba(244, 63, 94, 0.15) !important;
        color: #FB7185 !important;
        border: 1px solid rgba(244, 63, 94, 0.35) !important;
        box-shadow: 0 2px 6px rgba(244, 63, 94, 0.15) !important;
      }

      #reset-el:hover, #stop-el:hover, button[id*="reset"]:hover, button[id*="stop"]:hover {
        background: #F43F5E !important;
        color: #FFFFFF !important;
        border-color: #FB7185 !important;
        box-shadow: 0 4px 14px rgba(244, 63, 94, 0.4) !important;
      }

      /* Success / Start / Action Buttons */
      #shoot-el, button[id*="shoot"], button[id*="start"], button[id*="play"] {
        background: rgba(25, 185, 154, 0.15) !important;
        color: #34D399 !important;
        border: 1px solid rgba(25, 185, 154, 0.35) !important;
        box-shadow: 0 2px 6px rgba(25, 185, 154, 0.15) !important;
      }

      #shoot-el:hover, button[id*="shoot"]:hover, button[id*="start"]:hover, button[id*="play"]:hover {
        background: #19B99A !important;
        color: #FFFFFF !important;
        border-color: #34D399 !important;
        box-shadow: 0 4px 14px rgba(25, 185, 154, 0.4) !important;
      }

      /* ===================================================
         SELECT DROPDOWNS & INPUTS (VIDYAVERSE THEME)
         =================================================== */
      select {
        margin: 6px 0 !important;
        outline: none !important;
        background: #1C1C2A !important;
        color: #F0F0FA !important;
        border: 1px solid #2A2A3E !important;
        padding: 6px 28px 6px 12px !important;
        border-radius: 8px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
        appearance: none !important;
        -webkit-appearance: none !important;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237C5CFA'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 8px center !important;
        background-size: 14px !important;
      }

      select:hover, select:focus {
        border-color: #7C5CFA !important;
        box-shadow: 0 0 0 2px rgba(124, 92, 250, 0.25) !important;
      }

      select option {
        background: #1C1C2A !important;
        color: #F0F0FA !important;
        padding: 6px 10px !important;
      }

      input[type="range"] {
        accent-color: #6541F5 !important;
        cursor: pointer !important;
        vertical-align: middle;
        margin: 0 6px !important;
      }

      input[type="text"], input[type="number"] {
        background: #12121A !important;
        color: #F0F0FA !important;
        border: 1px solid #2A2A3E !important;
        border-radius: 6px !important;
        padding: 4px 8px !important;
        font-family: 'JetBrains Mono', ui-monospace, monospace !important;
        font-weight: 600 !important;
        font-size: 12px !important;
        text-align: center !important;
        outline: none !important;
      }

      input[type="text"]:focus, input[type="number"]:focus {
        border-color: #7C5CFA !important;
        box-shadow: 0 0 0 2px rgba(124, 92, 250, 0.25) !important;
      }

      /* lil-gui Modern Dark Palette */
      .lil-gui {
        --background-color: #161624 !important;
        --text-color: #F0F0FA !important;
        --title-background-color: #1C1C2A !important;
        --title-text-color: #F0F0FA !important;
        --widget-color: #1C1C2A !important;
        --hover-color: #26233E !important;
        --focus-color: #6541F5 !important;
        --number-color: #7C5CFA !important;
        --string-color: #19B99A !important;
        border: 1px solid #2A2A3E !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
      }

      /* 3D Floating CSS2D Labels */
      .label, .labelparts {
        color: #F0F0FA !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        background: rgba(22, 22, 36, 0.9) !important;
        border: 1px solid rgba(124, 92, 250, 0.4) !important;
        border-radius: 6px !important;
        padding: 3px 8px !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(8px) !important;
      }

      .fraction {
        color: #C4B5FD !important;
      }

      .fraction span.fdn {
        border-top: 1.5px solid #7C5CFA !important;
        color: #DDD6FE !important;
      }
    `;

    document.head.appendChild(styleEl);
  };

  // Dynamic Selector State Management
  const enhanceSimulationSelectors = () => {
    const updateSelectorStates = () => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      allButtons.forEach((btn) => {
        const bg = btn.style.backgroundColor || '';
        if (bg.includes('67, 97') || bg.includes('#034361')) {
          btn.setAttribute('data-selected', 'true');
        } else if (bg.includes('108, 156') || bg.includes('#036c9c')) {
          btn.setAttribute('data-selected', 'false');
        }
      });
    };

    updateSelectorStates();

    // Listen for user interactions to refresh states
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      setTimeout(updateSelectorStates, 25);
      setTimeout(updateSelectorStates, 100);
    }, true);

    // Observe changes to style attributes
    const observer = new MutationObserver(() => updateSelectorStates());
    const menuEl = document.getElementById('menu') || document.body;
    if (menuEl) {
      observer.observe(menuEl, { subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    }
  };

  const handleEmptySideMenus = () => {
    const sidemenu = document.getElementById('sidemenu');
    if (sidemenu) {
      const updateVisibility = () => {
        const text = sidemenu.innerText.trim();
        const hasVisibleChild = Array.from(sidemenu.children).some((el) => {
          const style = window.getComputedStyle(el);
          return style.visibility !== 'hidden' && style.display !== 'none' && el.innerText.trim().length > 0;
        });
        sidemenu.style.display = (hasVisibleChild || text.length > 0) ? 'block' : 'none';
      };
      updateVisibility();
      const obs = new MutationObserver(updateVisibility);
      obs.observe(sidemenu, { subtree: true, attributes: true, childList: true, attributeFilter: ['style', 'class'] });
    }
  };

  const applyVidyaVerseTheme = () => {
    try {
      document.body.style.backgroundColor = '#070b14';
      document.body.style.color = '#F0F0FA';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const topMenu = document.getElementById('topmenu');
      if (topMenu) topMenu.style.display = 'none';

      injectThemeStyles();
      enhanceSimulationSelectors();
      handleEmptySideMenus();
    } catch (e) {
      console.warn("[VidyaVerse Physics] Theme init error:", e);
    }
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', applyVidyaVerseTheme);
  } else {
    applyVidyaVerseTheme();
  }
})();
