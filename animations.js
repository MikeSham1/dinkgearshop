(function () {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    const nav = document.querySelector('nav');
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
      }, { passive: true });
    }
  });
})();
