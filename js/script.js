// alperenaydiner — script.js
// Sol menü aç/kapa + koyu/açık tema geçişi (tercih localStorage'da saklanır)

(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.menu-btn');
    const closeBtn = document.querySelector('.nav-close');
    const overlay = document.querySelector('.nav-overlay');
    const sideNav = document.querySelector('.side-nav');
    const themeBtn = document.querySelector('.theme-btn');

    function openNav() {
      sideNav.classList.add('open');
      overlay.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      sideNav.querySelector('a, button')?.focus();
    }
    function closeNav() {
      sideNav.classList.remove('open');
      overlay.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn?.addEventListener('click', openNav);
    closeBtn?.addEventListener('click', closeNav);
    overlay?.addEventListener('click', closeNav);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    themeBtn?.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('theme', next);
    });
  });
})();
