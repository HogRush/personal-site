/* ============================================================
   你的名字 · 个人主页 — 交互脚本
   主题切换 / 移动端导航 / 滚动入场 / 页脚年份
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 亮 / 暗主题切换 ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');

  function currentTheme() {
    return root.classList.contains('dark') ? 'dark' : 'light';
  }

  function syncToggle() {
    if (!toggle) return;
    var dark = currentTheme() === 'dark';
    var label = dark ? '切换到亮色模式' : '切换到暗色模式';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('title', label);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.classList.toggle('dark', next === 'dark');
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncToggle();
    });
  }

  /* 未手动选择过主题时，跟随系统偏好变化 */
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onSchemeChange = function (e) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) root.classList.toggle('dark', e.matches);
  };
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onSchemeChange);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onSchemeChange); /* 旧版 Safari */
  }

  syncToggle();

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
