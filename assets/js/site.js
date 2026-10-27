/* ==========================================================================
   JUJUTSU KAISEN — 咒术回战 视觉档案
   交互脚本：导航、滚动显现、角色筛选/档案、领域展开、页签等
   ========================================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const body = document.body;

  /* 01. Header, scroll progress ------------------------------------------- */
  const head = $('#siteHead');
  const progress = $('.scroll-progress span');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (head) head.classList.toggle('is-scrolled', y > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 02. Mobile navigation -------------------------------------------------- */
  const burger = $('#burger');
  const nav = $('#nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      body.style.overflow = open ? 'hidden' : '';
    });
    $$('.nav a', nav).forEach((a) => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* 03. Scroll reveal ------------------------------------------------------ */
  const revealEls = $$('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* 04. Cursor glow & hero parallax ---------------------------------------- */
  const glow = $('.cursor-glow');
  const orb = $('[data-orb]');
  if (glow && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let gx = 0, gy = 0, cx = 0, cy = 0, raf = null;
    const render = () => {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(render);
    };
    window.addEventListener('pointermove', (e) => {
      gx = e.clientX; gy = e.clientY;
      body.classList.add('has-pointer');
      if (!raf) render();
    }, { passive: true });
    document.addEventListener('pointerleave', () => body.classList.remove('has-pointer'));

    if (orb) {
      window.addEventListener('pointermove', (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        orb.style.setProperty('--mx', (nx * 12).toFixed(1) + 'px');
        orb.style.setProperty('--my', (ny * 10).toFixed(1) + 'px');
      }, { passive: true });
    }
  }

  /* 05. Number counters ---------------------------------------------------- */
  const counters = $$('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        const start = performance.now();
        const dur = 1400;
        function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(decimals);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* 06. Domain expansion overlay ------------------------------------------ */
  const domain = $('#domain');
  const domainName = $('#domainName');
  const domainNames = ['無量空處', '伏魔御廚子', '嵌合暗翳庭', '自閉圓頓裹', '真贗相愛', '坐殺博徒', '誅伏賜死'];
  let lastFocus = null;

  function openDomain() {
    if (!domain) return;
    closeNav();
    lastFocus = document.activeElement;
    if (domainName) {
      domainName.textContent = domainNames[Math.floor(Math.random() * domainNames.length)];
    }
    domain.classList.add('is-open');
    domain.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    const closeBtn = $('.domain__close', domain);
    if (closeBtn) setTimeout(() => closeBtn.focus(), 300);
  }
  function closeDomain() {
    if (!domain || !domain.classList.contains('is-open')) return;
    domain.classList.remove('is-open');
    domain.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-domain]').forEach((btn) => btn.addEventListener('click', openDomain));
  if (domain) {
    const closeBtn = $('.domain__close', domain);
    if (closeBtn) closeBtn.addEventListener('click', closeDomain);
    domain.addEventListener('click', (e) => {
      if (e.target === domain) closeDomain();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDomain();
      if (e.key === 'Tab' && domain.classList.contains('is-open')) {
        e.preventDefault();
        const btn = $('.domain__close', domain);
        if (btn) btn.focus();
      }
    });
  }

  /* 07. Footer year -------------------------------------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* 08. Character filters -------------------------------------------------- */
  const filterBar = $('[data-filters]');
  if (filterBar) {
    const cards = $$('.char-card');
    const countEl = $('[data-char-count]');
    const empty = $('[data-empty]');
    $$('.filter', filterBar).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.filter', filterBar).forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        const filter = btn.dataset.filter;
        let visible = 0;
        cards.forEach((card) => {
          const tags = (card.dataset.tags || '').split(/\s+/);
          const show = filter === 'all' || tags.includes(filter);
          card.hidden = !show;
          if (show) {
            visible += 1;
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = 'fadeUp .5s cubic-bezier(.16,1,.3,1) both';
          }
        });
        if (countEl) countEl.textContent = String(visible).padStart(2, '0');
        if (empty) empty.hidden = visible !== 0;
      });
    });
  }

  /* 09. Character modal ---------------------------------------------------- */
  const modal = $('#charModal');
  if (modal) {
    const panel = $('.modal__panel', modal);
    const visual = $('.modal__visual', modal);
    const kanjiEl = $('.modal__kanji', modal);
    const fields = {
      role: $('#mRole'), name: $('#mName'), romaji: $('#mRomaji'),
      desc: $('#mDesc'), affil: $('#mAffil'), tech: $('#mTech'),
      domain: $('#mDomain'), danger: $('#mDanger'), quote: $('#mQuote')
    };
    let opener = null;

    function openCharacter(card) {
      opener = card;
      const d = card.dataset;
      if (fields.role) fields.role.textContent = d.role || '';
      if (fields.name) fields.name.textContent = d.name || '';
      if (fields.romaji) fields.romaji.textContent = d.romaji || '';
      if (fields.desc) fields.desc.textContent = d.desc || '';
      if (fields.affil) fields.affil.textContent = d.affil || '—';
      if (fields.tech) fields.tech.textContent = d.tech || '—';
      if (fields.domain) fields.domain.textContent = d.domain || '—';
      if (fields.quote) fields.quote.textContent = d.quote ? '“' + d.quote + '”' : '';
      if (fields.quote) fields.quote.hidden = !d.quote;
      if (fields.danger) {
        const level = Math.max(1, Math.min(5, parseInt(d.danger || '3', 10)));
        fields.danger.innerHTML = '';
        for (let i = 1; i <= 5; i += 1) {
          const bar = document.createElement('i');
          if (i <= level) bar.className = 'on';
          fields.danger.appendChild(bar);
        }
      }
      if (visual) {
        visual.style.setProperty('--m1', d.c1 || '#e6344b');
        visual.style.setProperty('--m2', d.c2 || '#120812');
      }
      if (kanjiEl) kanjiEl.textContent = d.kanji || '';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
      const closeBtn = $('.modal__close', modal);
      if (closeBtn) setTimeout(() => closeBtn.focus(), 120);
    }

    function closeCharacter() {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
      if (opener) opener.focus();
    }

    $$('.char-card[data-name]').forEach((card) => {
      card.addEventListener('click', () => openCharacter(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCharacter(card);
        }
      });
    });

    const closeBtn = $('.modal__close', modal);
    if (closeBtn) closeBtn.addEventListener('click', closeCharacter);
    const backdrop = $('.modal__backdrop', modal);
    if (backdrop) backdrop.addEventListener('click', closeCharacter);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCharacter();
      if (e.key === 'Tab' && modal.classList.contains('is-open') && panel) {
        const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel)
          .filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* 10. World page tabs ---------------------------------------------------- */
  const tabBar = $('[data-tabs]');
  if (tabBar) {
    const tabs = $$('.tab', tabBar);
    const panels = $$('.tabpanel');
    function activate(tab) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === tab.getAttribute('aria-controls');
        p.classList.toggle('is-active', on);
        p.hidden = !on;
      });
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); next.focus(); activate(next); }
      });
    });
  }

  /* 11. Spoiler toggles ---------------------------------------------------- */
  $$('.spoiler').forEach((spoiler) => {
    const btn = $('.spoiler__btn', spoiler);
    if (!btn) return;
    btn.addEventListener('click', () => {
      spoiler.classList.add('is-revealed');
      btn.setAttribute('aria-expanded', 'true');
    });
  });

  /* 12. Console signature -------------------------------------------------- */
  try {
    console.log('%c呪術廻戦', 'color:#e6344b;font-size:28px;font-weight:bold;text-shadow:0 0 12px #e6344b');
    console.log('%c领域展开 · 非官方粉丝站', 'color:#968e9f;letter-spacing:4px');
  } catch (e) { /* noop */ }
})();
