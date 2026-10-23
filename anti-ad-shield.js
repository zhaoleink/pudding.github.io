/**
 * 防广告装置 · AdShield
 * 轻量护盾：拦截常见广告脚本/iframe，移除可疑浮层，保护本地小游戏不被注入广告。
 */
(function (global) {
  'use strict';

  const bootScript = document.currentScript;
  const STORAGE_KEY = 'ad_shield_on_v1';

  const AD_HOST_RE = [
    /doubleclick\.net/i,
    /googlesyndication\.com/i,
    /googleadservices\.com/i,
    /adservice\.google/i,
    /adnxs\.com/i,
    /adsrvr\.org/i,
    /taboola\.com/i,
    /outbrain\.com/i,
    /criteo\.com/i,
    /pubmatic\.com/i,
    /media\.net/i,
    /adform\.net/i,
    /moatads\.com/i,
    /amazon-adsystem\.com/i,
    /facebook\.com\/tr/i,
  ];

  const AD_IFRAME_RE = [
    /\/ads?\//i,
    /\/adserver/i,
    /\/advert/i,
    /\/banner/i,
    /\/sponsor/i,
  ];

  let enabled = true;
  let observer = null;
  let widgetEl = null;
  let blockedCount = 0;
  let nativeOpen = null;

  function readPref() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === '0') return false;
      if (v === '1') return true;
    } catch {}
    return true;
  }

  function savePref(on) {
    try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch {}
  }

  function isAdUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('blob:') || url.startsWith('data:')) return false;
    try {
      const u = new URL(url, global.location.href);
      const host = u.hostname + u.pathname;
      if (AD_HOST_RE.some(re => re.test(host))) return true;
      if (u.pathname.includes('ads') && /google|facebook|amazon/.test(u.hostname)) return true;
    } catch {
      return AD_HOST_RE.some(re => re.test(url));
    }
    return false;
  }

  function isAdIframe(el) {
    if (!el || el.tagName !== 'IFRAME') return false;
    const src = el.getAttribute('src') || el.src || '';
    if (!src) return false;
    if (isAdUrl(src)) return true;
    return AD_IFRAME_RE.some(re => re.test(src));
  }

  function isSuspiciousOverlay(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.id === 'ad-shield-widget' || el.closest?.('#ad-shield-widget')) return false;
    if (el.closest?.('#app, #game-wrap, #canvas-frame, #board, main, .start-screen')) return false;

    const tag = el.tagName;
    if (tag === 'IFRAME' && isAdIframe(el)) return true;

    const style = global.getComputedStyle(el);
    const z = parseInt(style.zIndex, 10);
    const fixed = style.position === 'fixed' || style.position === 'sticky';
    if (!fixed || !Number.isFinite(z) || z < 9000) return false;

    const idClass = `${el.id} ${el.className}`.toLowerCase();
    if (/ad[-_]?|banner|sponsor|promo|popup|interstitial|google_ads/.test(idClass)) return true;

    const iframe = el.querySelector?.('iframe');
    if (iframe && isAdIframe(iframe)) return true;

    const text = (el.textContent || '').trim();
    if (text.length < 80 && /广告|ad\s*content|sponsored/i.test(text)) return true;

    return false;
  }

  function removeNode(el, reason) {
    if (!el || !el.parentNode) return;
    try {
      el.remove();
      blockedCount += 1;
      updateWidget();
      if (global.AdShield?.onBlock) global.AdShield.onBlock(reason);
    } catch {}
  }

  function scanRoot(root) {
    if (!enabled || !root) return;
    if (root.nodeType === 1) {
      if (isAdIframe(root)) {
        removeNode(root, 'iframe');
        return;
      }
      if (isSuspiciousOverlay(root)) {
        removeNode(root, 'overlay');
        return;
      }
    }
    if (root.querySelectorAll) {
      root.querySelectorAll('iframe').forEach(f => {
        if (isAdIframe(f)) removeNode(f, 'iframe');
      });
    }
  }

  function hookScriptInsert() {
    const origAppend = Element.prototype.appendChild;
    const origInsert = Element.prototype.insertBefore;

    Element.prototype.appendChild = function (node) {
      if (enabled && node?.tagName === 'SCRIPT') {
        const src = node.src || node.getAttribute('src') || '';
        if (src && isAdUrl(src)) {
          blockedCount += 1;
          updateWidget();
          return node;
        }
      }
      return origAppend.call(this, node);
    };

    Element.prototype.insertBefore = function (node, ref) {
      if (enabled && node?.tagName === 'SCRIPT') {
        const src = node.src || node.getAttribute('src') || '';
        if (src && isAdUrl(src)) {
          blockedCount += 1;
          updateWidget();
          return node;
        }
      }
      return origInsert.call(this, node, ref);
    };
  }

  function hookWindowOpen() {
    nativeOpen = global.open;
    global.open = function (url, ...rest) {
      if (enabled && isAdUrl(String(url || ''))) {
        blockedCount += 1;
        updateWidget();
        return null;
      }
      return nativeOpen.call(global, url, ...rest);
    };
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(mutations => {
      if (!enabled) return;
      mutations.forEach(m => {
        m.addedNodes.forEach(n => scanRoot(n));
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function ensureStyles() {
    if (document.getElementById('ad-shield-styles')) return;
    const s = document.createElement('style');
    s.id = 'ad-shield-styles';
    s.textContent = `
      #ad-shield-widget {
        position: fixed;
        right: 12px;
        bottom: 12px;
        left: auto;
        z-index: 2147483646;
        font-family: system-ui, -apple-system, "PingFang SC", sans-serif;
        pointer-events: auto;
      }
      #ad-shield-widget .ad-shield-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 2px solid rgba(92, 158, 173, 0.45);
        border-radius: 999px;
        padding: 8px 14px 8px 10px;
        background: rgba(255, 255, 255, 0.94);
        color: #3a5a62;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(30, 60, 70, 0.15);
        transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
      }
      #ad-shield-widget .ad-shield-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 22px rgba(30, 60, 70, 0.2);
      }
      #ad-shield-widget.on .ad-shield-btn {
        border-color: rgba(92, 158, 173, 0.95);
        box-shadow: 0 0 0 3px rgba(92, 158, 173, 0.18), 0 4px 18px rgba(30, 60, 70, 0.15);
      }
      #ad-shield-widget.off .ad-shield-btn {
        opacity: 0.72;
        border-color: rgba(120, 120, 120, 0.35);
      }
      #ad-shield-widget .ad-shield-icon {
        font-size: 18px;
        line-height: 1;
      }
      #ad-shield-widget .ad-shield-count {
        font-size: 10px;
        font-weight: 600;
        color: #5c9ead;
        min-width: 1.2em;
        text-align: right;
      }
      #ad-shield-toast {
        position: fixed;
        left: 50%;
        bottom: 72px;
        transform: translateX(-50%) translateY(12px);
        z-index: 2147483647;
        padding: 10px 18px;
        border-radius: 999px;
        background: rgba(30, 50, 58, 0.92);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s, transform 0.25s;
      }
      #ad-shield-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    `;
    document.head.appendChild(s);
  }

  function showToast(msg) {
    let t = document.getElementById('ad-shield-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ad-shield-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function updateWidget() {
    if (!widgetEl) return;
    widgetEl.classList.toggle('on', enabled);
    widgetEl.classList.toggle('off', !enabled);
    const label = widgetEl.querySelector('.ad-shield-label');
    const count = widgetEl.querySelector('.ad-shield-count');
    if (label) label.textContent = enabled ? '护盾开' : '护盾关';
    if (count) count.textContent = blockedCount > 0 ? `×${blockedCount}` : '';
  }

  function createWidget() {
    if (widgetEl || document.getElementById('ad-shield-widget')) return;
    ensureStyles();
    widgetEl = document.createElement('div');
    widgetEl.id = 'ad-shield-widget';
    widgetEl.innerHTML = `
      <button type="button" class="ad-shield-btn" aria-pressed="true" title="防广告装置 · 点击开关">
        <span class="ad-shield-icon" aria-hidden="true">🛡️</span>
        <span class="ad-shield-label">护盾开</span>
        <span class="ad-shield-count"></span>
      </button>`;
    widgetEl.querySelector('.ad-shield-btn').addEventListener('click', () => {
      setEnabled(!enabled);
      showToast(enabled ? '🛡️ 护盾已开启 · 广告退散' : '护盾已关闭');
    });
    document.body.appendChild(widgetEl);
    updateWidget();
  }

  function setEnabled(on) {
    enabled = !!on;
    savePref(enabled);
    updateWidget();
    if (enabled) {
      startObserver();
      scanRoot(document.documentElement);
    }
  }

  function init(opts = {}) {
    enabled = opts.forceOff ? false : readPref();
    hookScriptInsert();
    hookWindowOpen();
    if (opts.widget !== false) {
      if (document.body) createWidget();
      else document.addEventListener('DOMContentLoaded', createWidget);
    }
    if (enabled) {
      startObserver();
      if (document.body) scanRoot(document.body);
      else document.addEventListener('DOMContentLoaded', () => scanRoot(document.body));
    }
    return api;
  }

  function applyHubNavLocal() {
    const page = document.documentElement.getAttribute('data-page')
      || decodeURIComponent((global.location.pathname.split('/').pop() || 'index.html'));
    document.querySelectorAll('.hub-nav a[data-only-page]').forEach(a => {
      if (a.getAttribute('data-only-page') !== page) a.remove();
    });
  }

  const api = {
    init,
    enable() { setEnabled(true); },
    disable() { setEnabled(false); },
    isOn() { return enabled; },
    get blocked() { return blockedCount; },
    scan: () => scanRoot(document.documentElement),
    applyHubNavLocal,
  };

  global.AdShield = api;

  function boot() {
    const hideWidget = bootScript?.dataset?.widget === 'off';
    init({ widget: !hideWidget });
    applyHubNavLocal();
  }

  if (document.currentScript?.dataset?.auto !== 'off') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
