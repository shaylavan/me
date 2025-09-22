(function () {
  const SPEED_PX_PER_SEC = 50; // reduced speed for slower scrolling
  const STORAGE_KEY = 'bannerStart';
  const ticker = document.getElementById('ticker');
  const textEl = document.getElementById('ticker-text');

  if (!ticker || !textEl) return;

  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    ticker.style.paddingLeft = '1rem';
    return;
  }

  // Remove any existing clones first
  while (ticker.children.length > 1) {
    ticker.removeChild(ticker.lastChild);
  }

  // Create enough clones to fill the viewport plus one extra
  const containerWidth = document.getElementById('top-banner').offsetWidth;
  const textWidth = textEl.offsetWidth;
  const neededClones = Math.ceil(containerWidth / textWidth) + 2; // +2 for buffer

  for (let i = 0; i < neededClones; i++) {
    const clone = textEl.cloneNode(true);
    clone.style.paddingLeft = '2rem';
    ticker.appendChild(clone);
  }

  function measureAndAnimate() {
    const containerWidth = document.getElementById('top-banner').offsetWidth;
    const textWidth = textEl.offsetWidth;
    const totalWidth = textWidth * ticker.children.length;
    const cycleLength = textWidth; // Only need to scroll one text width before resetting

    const start = parseInt(localStorage.getItem(STORAGE_KEY), 10) || Date.now();

    let rafId;
    function step() {
      const elapsedMs = Date.now() - start;
      const totalPx = (elapsedMs / 1000) * SPEED_PX_PER_SEC;
      const offset = totalPx % cycleLength;

      // Reset position when one full text width has been scrolled
      if (offset >= cycleLength) {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }

      ticker.style.transform = `translateX(${-offset}px)`;
      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);

    // Pause/resume on hover
    const banner = document.getElementById('top-banner');
    let isPaused = false;
    function pause() { if (!isPaused) { cancelAnimationFrame(rafId); isPaused = true; } }
    function resume() { if (isPaused) { isPaused = false; rafId = requestAnimationFrame(step); } }
    banner.addEventListener('mouseenter', pause);
    banner.addEventListener('mouseleave', resume);
    banner.addEventListener('focusin', pause);
    banner.addEventListener('focusout', resume);

    // Re-measure on resize
    window.addEventListener('resize', () => {
      cancelAnimationFrame(rafId);
      // Recreate clones for new container size
      while (ticker.children.length > 1) {
        ticker.removeChild(ticker.lastChild);
      }
      const newContainerWidth = document.getElementById('top-banner').offsetWidth;
      const newNeededClones = Math.ceil(newContainerWidth / textWidth) + 2;
      for (let i = 0; i < newNeededClones; i++) {
        const clone = textEl.cloneNode(true);
        clone.style.paddingLeft = '2rem';
        ticker.appendChild(clone);
      }
      measureAndAnimate();
    });
  }

  window.requestAnimationFrame(measureAndAnimate);
})();
