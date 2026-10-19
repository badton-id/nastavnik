/* Поведение страницы: шапка, меню, появление блоков, якоря, подсветка раздела.

   Свой скрипт, а не page.js шаблона: там тема, ленты и форма, которых
   здесь нет. Библиотек нет, всё на нативных API. */
(function () {
  'use strict';

  /* Метка для стилей: блоки прячутся перед появлением, только если скрипт
     действительно работает. */
  document.documentElement.classList.add('js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Шапка ─────────────────────────────── */
  var hdr = document.getElementById('hdr'), tick = false;
  function onScroll() {
    hdr.classList.toggle('stuck', (window.scrollY || 0) > 24);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (!tick) { tick = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ── Меню на телефоне ──────────────────── */
  var mnav = document.getElementById('mnav'), burger = document.getElementById('burger');
  function setMenu(open) {
    mnav.classList.toggle('open', open);
    /* Под открытым меню сплошной лист: шапка по этому классу сразу становится
       сплошной, даже если страница стоит на первом экране. */
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!mnav.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  /* Выросло окно, а меню осталось открытым: закрываем, иначе страница
     застынет без прокрутки. */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 920 && mnav.classList.contains('open')) setMenu(false);
  });

  /* ── Появление блоков ──────────────────── */
  /* Соседи появляются волной: задержка растёт по порядку среди .rv
     одного родителя, но не дольше пяти шагов. */
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var sibs = Array.prototype.filter.call(en.target.parentNode.children, function (n) {
          return n.classList.contains('rv');
        });
        var i = sibs.indexOf(en.target);
        en.target.style.transitionDelay = (i > 0 ? Math.min(i, 5) * 90 : 0) + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Якоря с учётом шапки ──────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var t = id && document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var top = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - hdr.offsetHeight;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      /* Фокус переходит к разделу, чтобы клавиатура и экранный чтец
         продолжили с него, а не с места клика. */
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });

  /* ── Подсветка раздела в меню ──────────── */
  /* Пункт верхнего меню подчёркнут, пока на экране его раздел. Раздел
     считается текущим, когда его верх прошёл линию на трети высоты окна. */
  var links = Array.prototype.slice.call(document.querySelectorAll('.hdr-nav a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  function markCurrent() {
    var line = window.innerHeight * 0.33, cur = -1;
    targets.forEach(function (t, i) {
      if (!t) return;
      var r = t.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) cur = i;
    });
    links.forEach(function (a, i) {
      if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  var tick2 = false;
  window.addEventListener('scroll', function () {
    if (!tick2) { tick2 = true; requestAnimationFrame(function () { markCurrent(); tick2 = false; }); }
  }, { passive: true });
  markCurrent();

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
