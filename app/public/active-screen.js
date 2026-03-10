// Highlight active nav item based on current screen
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure nav is loaded
  setTimeout(() => {
    const navLinks = document.querySelectorAll('.fixed.bottom-0 .nav-item');
    if (!navLinks.length) {
      // Try alternative selector if nav is still loading
      const navContainer = document.querySelector('.fixed.bottom-0 nav');
      if (navContainer) {
        const links = navContainer.querySelectorAll('a');
        links.forEach(link => {
          const path = window.location.pathname.split('/').pop();
          if (link.getAttribute('href') === path) {
            link.classList.add('text-primary');
            link.classList.remove('text-slate-400');
          } else {
            link.classList.remove('text-primary');
            link.classList.add('text-slate-400');
          }
        });
      }
      return;
    }
    
    const path = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
      if (link.getAttribute('href') === path) {
        link.classList.add('text-primary');
        link.classList.remove('text-slate-400');
      } else {
        link.classList.remove('text-primary');
        link.classList.add('text-slate-400');
      }
    });
  }, 100);
});
