// Runs on every page. Keeps small, page-agnostic setup here so we don't
// repeat it in every page-specific script.

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-enter');
  initScrollReveals();
});

// Adds the .is-visible class (see animations.css) to any element marked
// .reveal-on-scroll once it enters the viewport.
function initScrollReveals() {
  const targets = document.querySelectorAll('.reveal-on-scroll');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}
