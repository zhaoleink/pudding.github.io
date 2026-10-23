/** 游戏页用：焦点在输入框或输入法组字时不抢键盘 */
(function () {
  'use strict';
  function shouldIgnoreGameKey(e) {
    if (!e) return true;
    if (e.isComposing) return true;
    const t = e.target;
    if (!t || t === document.body || t === document.documentElement) return false;
    if (t.closest && t.closest('input, textarea, select, option, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]')) {
      return true;
    }
    const tag = (t.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }
  window.HubKeyboard = { shouldIgnoreGameKey: shouldIgnoreGameKey };
})();
