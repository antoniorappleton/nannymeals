// NannyMeals — Active screen highlighter v2
// Highlights the correct nav item in both mobile bottom nav and desktop sidebar
(function () {
  function highlightActive() {
    const path = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Mobile bottom nav
    const bottomNavItems = document.querySelectorAll('.nm-bottom-nav .nav-item[data-page]');
    bottomNavItems.forEach(link => {
      const isActive = link.getAttribute('data-page') === path;
      if (isActive) {
        link.classList.add('text-primary');
        link.classList.remove('text-slate-400', 'dark:text-slate-500');
        const icon = link.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        const label = link.querySelector('span:last-child');
        if (label) label.classList.add('font-black');
      }
    });

    // Desktop sidebar
    const sidebarItems = document.querySelectorAll('.nm-sidebar .sidebar-nav-item[data-page]');
    sidebarItems.forEach(link => {
      const isActive = link.getAttribute('data-page') === path;
      if (isActive) {
        link.classList.add('text-primary', 'bg-primary/10');
        link.classList.remove('text-slate-500', 'dark:text-slate-400');
        const icon = link.querySelector('.material-symbols-outlined');
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
      }
    });
  }

  // Run after nav is likely loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(highlightActive, 120));
  } else {
    setTimeout(highlightActive, 120);
  }
})();
