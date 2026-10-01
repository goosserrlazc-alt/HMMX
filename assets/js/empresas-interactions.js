// reveal on scroll
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function(el){ el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(function (el) { io.observe(el); });
})();

// logos marquee: duplicate track for seamless loop
(function () {
  var track = document.getElementById('logos-track');
  if (track) track.innerHTML += track.innerHTML;
})();

// dinamica cards: tap/click to flip
(function () {
  document.querySelectorAll('[data-card]').forEach(function (card) {
    card.addEventListener('click', function () { card.classList.toggle('flipped'); });
  });
})();

// hero parallax (rAF-throttled: avoids per-frame layout thrash from a raw scroll listener)
(function () {
  var bg = document.getElementById('eb-hero-bg');
  if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var img = bg.querySelector('img');
  var ticking = false;
  function update() {
    var y = window.scrollY;
    if (y < window.innerHeight) img.style.transform = 'translateY(' + (y * 0.25) + 'px)';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();
