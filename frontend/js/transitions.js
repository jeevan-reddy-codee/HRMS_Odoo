// Fades the page out just before navigating to a new HTML file, so
// clicking between pages feels like a transition rather than a hard cut.
// (Plain multi-page site — this fakes continuity without a JS router.)

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (link.target === '_blank' || e.metaKey || e.ctrlKey) return; // let these behave normally

      e.preventDefault();
      document.body.style.transition = 'opacity 0.18s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 180);
    });
  });
});
