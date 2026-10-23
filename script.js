/* ============================================================
   你的名字 · 个人主页 — 交互脚本
   主题切换 / 移动端导航 / 滚动入场 / 页脚年份
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 主题：跟随系统 / 浅色 / 深色 三态 ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var ORDER = ['system', 'light', 'dark'];
  var LABELS = { system: '跟随系统', light: '浅色', dark: '深色' };
  var NEXT_LABELS = { system: '浅色', light: '深色', dark: '跟随系统' };

  function readPreference() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch (e) {}
    return 'system';
  }

  var preference = readPreference();

  function syncToggle() {
    if (!toggle) return;
    var label = '当前：' + LABELS[preference] +
      (preference === 'system' ? '（系统为' + (mq.matches ? '深色' : '浅色') + '）' : '') +
      '，点击切换为' + NEXT_LABELS[preference];
    toggle.setAttribute('data-mode', preference);
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }

  function applyTheme(pref, persist) {
    preference = pref;
    var dark = pref === 'dark' || (pref === 'system' && mq.matches);
    root.classList.toggle('dark', dark);
    root.setAttribute('data-theme', pref);
    if (persist) {
      try { localStorage.setItem('theme', pref); } catch (e) {}
    }
    syncToggle();
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length], true);
    });
  }

  /* 偏好为“跟随系统”时，系统主题变化立即生效（无需刷新） */
  function onSchemeChange() {
    if (preference === 'system') applyTheme('system', false);
    else syncToggle();
  }
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onSchemeChange);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onSchemeChange); /* 旧版 Safari */
  }

  /* 其它标签页修改偏好时同步 */
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme') applyTheme(readPreference(), false);
  });

  applyTheme(preference, false);

  /* ---------- 移动端导航 ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', '打开菜单');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- 滚动入场动效 ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    /* 兜底：若 3 秒后仍有元素未入场，手动视口检查一次
       （某些无头/异常环境 IntersectionObserver 回调不触发） */
    setTimeout(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          el.classList.add('is-visible');
        }
      });
    }, 3000);
  }

  /* ---------- 页脚年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
