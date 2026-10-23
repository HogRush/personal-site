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

  /* ---------- 页脚纸屑：滚入视口时飘落一次 ---------- */
  var PAPER_KEY = 'footerPaperPlayed';
  /* 只用站点色板：柔色 / 边框 / accent / 弱化 / 主色 */
  var PAPER_COLORS = [
    { fill: '#FDF6EE', fold: 'rgba(212,165,116,.16)' },
    { fill: '#FDF6EE', fold: 'rgba(212,165,116,.16)' },
    { fill: '#E7E5E4', fold: 'rgba(168,162,158,.26)' },
    { fill: '#E7E5E4', fold: 'rgba(168,162,158,.26)' },
    { fill: '#D4A574', fold: 'rgba(87,83,78,.16)' },
    { fill: '#D4A574', fold: 'rgba(87,83,78,.16)' },
    { fill: '#A8A29E', fold: 'rgba(87,83,78,.18)' },
    { fill: '#57534E', fold: 'rgba(168,162,158,.24)' }
  ];

  var paperCanvas = null;
  var paperCtx = null;
  var paperRaf = 0;
  var paperBits = [];
  var paperW = 0;
  var paperH = 0;
  var paperAlpha = 1;
  var paperLast = 0;

  function paperResize() {
    if (!paperCanvas) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    paperW = window.innerWidth;
    paperH = window.innerHeight;
    paperCanvas.width = Math.round(paperW * dpr);
    paperCanvas.height = Math.round(paperH * dpr);
    paperCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildPaper(originY) {
    var count = paperW <= 480 ? 20 + Math.floor(Math.random() * 5)
                              : 40 + Math.floor(Math.random() * 11);
    var center = paperW / 2;
    var spread = Math.min(paperW * 0.82, 980);
    paperBits = [];
    for (var i = 0; i < count; i++) {
      var c = PAPER_COLORS[(Math.random() * PAPER_COLORS.length) | 0];
      var x = center + (Math.random() - 0.5) * spread;
      paperBits.push({
        x: x,
        y: originY + (Math.random() - 0.5) * 18,
        vx: (x - center) / (spread / 2) * 0.7 + (Math.random() - 0.5) * 1.1,
        vy: -(11 + Math.random() * 3),
        w: 4 + Math.random() * 5,
        h: 8 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.1,
        flip: Math.random() * Math.PI * 2,
        flipV: 0.035 + Math.random() * 0.055,
        swayAmp: 8 + Math.random() * 12,
        swayW: 0.0012 + Math.random() * 0.0012,
        swayPhase: Math.random() * Math.PI * 2,
        g: 0.26 + Math.random() * 0.08,
        drag: 0.988 + Math.random() * 0.004,
        fall: 2 + Math.random() * 0.7,   /* 终端速度：轻纸片不会被重力一直加速 */
        color: c.fill,
        fold: c.fold,
        life: 3500 + Math.random() * 1000,
        age: 0
      });
    }
  }

  function drawPaper(p, alpha) {
    var sy = 0.675 + 0.325 * Math.cos(p.flip);
    var x = p.x + Math.sin(p.age * p.swayW + p.swayPhase) * p.swayAmp;
    paperCtx.save();
    paperCtx.translate(x, p.y);
    paperCtx.rotate(p.rot);
    paperCtx.scale(1, sy);
    paperCtx.globalAlpha = alpha;

    var w = p.w;
    var h = p.h;
    paperCtx.fillStyle = p.color;
    paperCtx.fillRect(-w / 2, -h / 2, w, h);
    paperCtx.fillStyle = p.fold;
    paperCtx.fillRect(-w / 2, -h / 2, w * 0.45, h);
    paperCtx.strokeStyle = 'rgba(28,25,23,.14)';
    paperCtx.lineWidth = 0.6;
    paperCtx.strokeRect(-w / 2 + 0.3, -h / 2 + 0.3, w - 0.6, h - 0.6);
    paperCtx.restore();
  }

  function paperFrame(now) {
    var dt = Math.min(2.5, (now - paperLast) / 16.667);
    paperLast = now;
    paperCtx.clearRect(0, 0, paperW, paperH);

    var alive = false;
    for (var i = 0; i < paperBits.length; i++) {
      var p = paperBits[i];
      if (p.age >= p.life) continue;
      p.age += dt * 16.667;

      p.vy += p.g * dt;
      p.vx *= Math.pow(p.drag, dt);
      p.vy *= Math.pow(p.drag, dt);
      if (p.vy > p.fall) p.vy = p.fall;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.rotV * dt;
      p.flip += p.flipV * dt;

      var local = p.age / p.life;
      var fadeAt = 1 - 800 / p.life;
      var a = local > fadeAt ? (1 - local) / (1 - fadeAt) : 1;
      drawPaper(p, Math.max(0, a) * paperAlpha);
      alive = true;
    }

    if (alive) {
      paperRaf = requestAnimationFrame(paperFrame);
    } else {
      stopPaper();
    }
  }

  function stopPaper() {
    if (paperRaf) {
      cancelAnimationFrame(paperRaf);
      paperRaf = 0;
    }
    window.removeEventListener('resize', paperResize);
    if (paperCanvas && paperCanvas.parentNode) {
      paperCanvas.parentNode.removeChild(paperCanvas);
    }
    paperCanvas = null;
    paperCtx = null;
    paperBits = [];
  }

  function playPaper(footer) {
    if (paperCanvas) return;

    var dpr = Math.min(2, window.devicePixelRatio || 1);

    paperW = window.innerWidth;
    paperH = window.innerHeight;
    paperAlpha = root.classList.contains('dark') ? 0.72 : 1;

    var rect = footer.getBoundingClientRect();
    var originY = Math.max(paperH * 0.45, Math.min(paperH * 0.95, rect.top + 4));

    paperCanvas = document.createElement('canvas');
    paperCanvas.className = 'paper-fx';
    paperCanvas.setAttribute('aria-hidden', 'true');
    paperCanvas.width = Math.round(paperW * dpr);
    paperCanvas.height = Math.round(paperH * dpr);
    document.body.appendChild(paperCanvas);

    paperCtx = paperCanvas.getContext('2d');
    paperCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildPaper(originY);
    paperLast = performance.now();
    window.addEventListener('resize', paperResize, { passive: true });
    paperRaf = requestAnimationFrame(paperFrame);
  }

  function initFooterPaper() {
    var footer = document.querySelector('.site-footer');
    if (!footer || typeof window.IntersectionObserver !== 'function') return;

    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;

    try {
      if (sessionStorage.getItem(PAPER_KEY)) return;
    } catch (e) {}

    var played = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || played || motion.matches) return;
        played = true;
        observer.disconnect();
        try { sessionStorage.setItem(PAPER_KEY, '1'); } catch (e) {}
        playPaper(footer);
      });
    }, { threshold: 0.5 });
    observer.observe(footer);

    function onMotionChange() {
      if (motion.matches) stopPaper();
    }

    if (typeof motion.addEventListener === 'function') {
      motion.addEventListener('change', onMotionChange);
    } else if (typeof motion.addListener === 'function') {
      motion.addListener(onMotionChange); /* 旧版 Safari */
    }
  }

  initFooterPaper();

  /* ---------- 页脚年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
