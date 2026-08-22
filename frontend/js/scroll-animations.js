// Extra scroll-driven effects beyond the basic reveal in main.js —
// e.g. a subtle parallax drift on the auth page's 3D scene container.

document.addEventListener('DOMContentLoaded', () => {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });

  // Stagger-reveal any card grids so items don't all pop in at once.
  document.querySelectorAll('.card-grid').forEach((grid) => {
    [...grid.children].forEach((child, i) => {
      child.classList.add('reveal-on-scroll');
      child.style.transitionDelay = `${i * 60}ms`;
    });
  });
});
