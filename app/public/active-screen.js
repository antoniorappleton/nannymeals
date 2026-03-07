// Highlight active nav item based on current screen
const navLinks = document.querySelectorAll('.fixed.bottom-0 nav a');
const path = window.location.pathname.split('/').pop();
navLinks.forEach(link => {
  if (link.getAttribute('href') === path) {
    link.classList.add('text-primary', 'font-black');
    link.classList.remove('text-slate-400');
  } else {
    link.classList.remove('text-primary', 'font-black');
    link.classList.add('text-slate-400');
  }
});