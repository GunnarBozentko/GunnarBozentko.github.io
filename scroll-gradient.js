// Crossfades the fixed gradient background between two stacked layers as the
// visitor scrolls past each <section> in <main>, and drives a dot nav on the
// right edge. Shared by all three pages; sections get a `data-gradient`
// theme (t1..t5, cycling) auto-assigned in DOM order unless one is already
// set (index.html sets its own so the hero/cta panels keep a deliberate
// theme). Pages whose sections are rendered from CSV data (skiing.js,
// resume.js) call window.initScrollGradient() themselves once their
// innerHTML is in place, since this file's own on-load run finds nothing yet.
(function () {
  const THEMES = ['t1', 't2', 't3', 't4', 't5'];

  function init() {
    if (window.__scrollGradientInitialized) return;

    const layerA = document.querySelector('.bg-layer--a');
    const layerB = document.querySelector('.bg-layer--b');
    const sections = Array.from(document.querySelectorAll('main section'));
    if (!layerA || !layerB || !sections.length) return;

    sections.forEach((section, i) => {
      if (!section.dataset.gradient) section.dataset.gradient = THEMES[i % THEMES.length];
      if (!section.id) section.id = `section-${i + 1}`;
    });

    let dotsNav = document.querySelector('.section-dots');
    if (!dotsNav) {
      dotsNav = document.createElement('nav');
      dotsNav.className = 'section-dots';
      dotsNav.setAttribute('aria-label', 'Page sections');
      document.body.appendChild(dotsNav);
    }
    if (!dotsNav.children.length) {
      sections.forEach((section) => {
        const heading = section.querySelector('h1, h2');
        const btn = document.createElement('button');
        btn.dataset.target = section.id;
        btn.setAttribute('aria-label', heading ? heading.textContent.trim() : section.id);
        dotsNav.appendChild(btn);
      });
    }
    const dots = Array.from(dotsNav.querySelectorAll('button'));

    let front = layerA;
    let back = layerB;
    let currentTheme = sections[0].dataset.gradient;
    front.dataset.theme = currentTheme;
    front.style.opacity = '1';

    function showTheme(theme) {
      if (theme === currentTheme) return;
      back.dataset.theme = theme;
      back.style.opacity = '1';
      front.style.opacity = '0';
      [front, back] = [back, front];
      currentTheme = theme;
    }

    function setActiveDot(id) {
      dots.forEach((dot) => {
        if (dot.dataset.target === id) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    setActiveDot(sections[0].id);

    // A thin horizontal line at mid-viewport (root shrunk 50% top and
    // bottom): a section is "current" exactly when it crosses that line, so
    // fast/instant scrolls still land on the right section instead of
    // whichever happened to report isIntersecting last.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showTheme(entry.target.dataset.gradient);
            setActiveDot(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    window.__scrollGradientInitialized = true;
  }

  window.initScrollGradient = init;
  init();
})();
