/* Поведение страницы Андрея: шапка, меню, появление блоков, якоря.

   Свой скрипт, а не page.js шаблона: там тема, ленты и форма, которых
   здесь нет, и контакты другого человека в текстах ошибок. */
(function () {
  'use strict';

  /* Метка для стилей: блоки прячутся перед появлением, только если скрипт
     действительно работает. */
  document.documentElement.classList.add('js');

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
    /* Под открытым меню белый лист: шапка по этому классу сразу становится
       "на белом", даже если страница стоит на чёрном первом экране. */
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!mnav.classList.contains('open')); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ── Появление блоков ──────────────────── */
  /* Соседи появляются волной: задержка растёт по порядку среди .rv
     одного родителя, но не дольше пяти шагов. */
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
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
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
