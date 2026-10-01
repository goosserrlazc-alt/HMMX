
(function () {
  "use strict";
  function perView() {
    if (window.matchMedia("(max-width:560px)").matches) return 1;
    if (window.matchMedia("(max-width:860px)").matches) return 2;
    return 3;
  }
  function setup(root) {
    var track = root.querySelector(".gal-track");
    var dotsWrap = root.querySelector(".gal-dots");
    var prevBtn = root.querySelector(".gal-prev");
    var nextBtn = root.querySelector(".gal-next");
    var slider = root.querySelector(".gal-slider");
    if (!track || !dotsWrap) return;
    var slides = track.querySelectorAll(".gal-slide");
    var total = slides.length;
    if (!total) return;
    var pos = 0, timer = null;
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function pages() { return Math.max(1, Math.ceil(total / perView())); }

    function render() {
      var pv = perView();
      var np = pages();
      if (pos > np - 1) pos = np - 1;
      var slideW = slides[0].getBoundingClientRect().width;
      var gap = 12;
      var startIndex = pos * pv;
      var maxIndex = Math.max(0, total - pv);
      if (startIndex > maxIndex) startIndex = maxIndex;
      track.style.transform = "translateX(-" + (startIndex * (slideW + gap)) + "px)";
      if (dotsWrap.children.length !== np) {
        dotsWrap.innerHTML = "";
        for (var i = 0; i < np; i++) {
          var b = document.createElement("button");
          b.className = "gal-dot";
          b.setAttribute("aria-label", "Ir al grupo " + (i + 1));
          (function (idx) { b.addEventListener("click", function () { pos = idx; render(); restart(); }); })(i);
          dotsWrap.appendChild(b);
        }
      }
      for (var j = 0; j < dotsWrap.children.length; j++) {
        dotsWrap.children[j].classList.toggle("active", j === pos);
      }
    }

    function next() { pos = pos >= pages() - 1 ? 0 : pos + 1; render(); }
    function prev() { pos = pos <= 0 ? pages() - 1 : pos - 1; render(); }
    function start() { if (prefersReduced) return; stop(); timer = setInterval(next, 4500); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { start(); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }
    window.addEventListener("resize", render);
    render();
    start();
  }
  function initAll() {
    var carousels = document.querySelectorAll(".gal-carousel");
    for (var k = 0; k < carousels.length; k++) setup(carousels[k]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
