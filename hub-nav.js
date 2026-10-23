/** 顶栏 — 全部游戏入口常显；仅标记当前页（可选） */
(function () {
  'use strict';

  function pageBase(href) {
    if (!href) return '';
    try {
      return decodeURIComponent(href.split('/').pop().split('?')[0].split('#')[0]);
    } catch (e) {
      return '';
    }
  }

  function currentPageId() {
    var fromHtml = document.documentElement.getAttribute('data-page');
    if (fromHtml) return fromHtml;
    return pageBase(location.pathname);
  }

  function markCurrentHubLink() {
    var PAGE = currentPageId();
    document.querySelectorAll('.hub-nav a[href]').forEach(function (a) {
      var base = pageBase(a.getAttribute('href'));
      var only = a.getAttribute('data-only-page');
      var match = (only && only === PAGE) || base === PAGE;
      if (match) {
        a.classList.add('hub-nav-here');
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function run() {
    if (!document.querySelector('.hub-nav')) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', markCurrentHubLink);
    } else {
      markCurrentHubLink();
    }
  }

  run();
})();
