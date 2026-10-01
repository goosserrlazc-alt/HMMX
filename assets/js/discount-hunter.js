
(function () {
  // 1) Pega aquí el link de tu Google Form:
  var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe_Er2GowiBqbxDXOPZ3wz3SKvWCUA_GcIoT_fPd6PKTUC40A/viewform";

  // 2) Cada cuántos ms cambia de lugar/forma (60000 = 1 minuto):
  var INTERVAL_MS = 60000;

  // Distintos disfraces chistosos, solo el emoji (sin fondo ni forma):
  var SKINS = ["🤡", "🍉", "🍌", "🍍", "🍓", "🥑", "🍒", "🤪", "🍇", "🥳"];

  function createButton() {
    var btn = document.createElement("a");
    btn.id = "hmmx-discount-btn";
    btn.href = FORM_URL;
    btn.target = "_blank";
    btn.rel = "noopener";
    document.body.appendChild(btn);
    return btn;
  }

  function disguise(btn) {
    btn.textContent = SKINS[Math.floor(Math.random() * SKINS.length)];
  }

  function place(btn) {
    var margin = 10;
    var w = btn.offsetWidth || 28;
    var h = btn.offsetHeight || 28;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    btn.style.top = btn.style.bottom = btn.style.left = btn.style.right = "auto";

    var edge = ["top", "bottom", "left", "right"][Math.floor(Math.random() * 4)];

    if (edge === "top") {
      btn.style.top = margin + "px";
      btn.style.left = Math.max(margin, Math.floor(Math.random() * (vw - w - margin * 2))) + "px";
    } else if (edge === "bottom") {
      btn.style.bottom = margin + "px";
      btn.style.left = Math.max(margin, Math.floor(Math.random() * (vw - w - margin * 2))) + "px";
    } else if (edge === "left") {
      btn.style.left = margin + "px";
      btn.style.top = Math.max(margin, Math.floor(Math.random() * (vh - h - margin * 2))) + "px";
    } else {
      btn.style.right = margin + "px";
      btn.style.top = Math.max(margin, Math.floor(Math.random() * (vh - h - margin * 2))) + "px";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = createButton();
    disguise(btn);
    place(btn);
    setInterval(function () {
      disguise(btn);
      place(btn);
    }, INTERVAL_MS);
    window.addEventListener("resize", function () { place(btn); });
  });
})();
